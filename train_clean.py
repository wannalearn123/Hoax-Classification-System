"""
Clean 2-class hoax detector training for Kaggle/Colab GPU.
Run as:  !python train_clean.py   (in Kaggle/Colab, GPU runtime)

Fixes vs train.ipynb:
- num_labels=2 with proper id2label/label2id so config.json saves 2 classes (not 5)
- consistent output/save paths and a real zip
- report_to="none", fp16 when GPU present
- saves model + tokenizer into a self-contained dir you drop into Hoaks_Cls/models
"""
import kagglehub
import os
import re
import glob
import shutil
import string

import numpy as np
import pandas as pd
import torch
import evaluate
from datasets import Dataset, DatasetDict, ClassLabel
from transformers import (
    AutoTokenizer,
    AutoConfig,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
    pipeline,
    EarlyStoppingCallback,
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Device:", DEVICE, "| CUDA:", torch.cuda.is_available())
os.environ["WANDB_DISABLED"] = "true"

# ---------------------------------------------------------------- data paths

fact_path = kagglehub.dataset_download(
    "linkgish/indonesian-fact-and-hoax-political-news")
hoax_path = kagglehub.dataset_download(
    "ireddragonicy/indonesian-hoax-news-dataset")

CNN = f"{fact_path}/Summarized/dataset_cnn_summarized.xlsx"
KOMPAS = f"{fact_path}/Summarized/dataset_kompas_summarized.xlsx"
TEMPO = f"{fact_path}/Summarized/dataset_tempo_summarized.xlsx"
TURNBACKHOAX = f"{fact_path}/Summarized/dataset_turnbackhoax_summarized.xlsx"
ALT_HOAX = f"{hoax_path}/komdigi_hoaks.csv"

# ---------------------------------------------------------------- load
df_cnn = pd.read_excel(CNN, index_col="index")
df_kompas = pd.read_excel(KOMPAS, index_col="index")
df_tempo = pd.read_excel(TEMPO, index_col="index")
df_turnbackhoax = pd.read_excel(TURNBACKHOAX, index_col="index")
df_hoax = pd.read_csv(ALT_HOAX).rename(columns={"body_text": "cleaned"})

# recover missing 'cleaned' from 'raw narasi' BEFORE dropna (validated: 3879/3879 rows recoverable)
if "raw narasi" in df_turnbackhoax.columns:
    df_turnbackhoax["cleaned"] = df_turnbackhoax["cleaned"].fillna(
        df_turnbackhoax["raw narasi"])

for df in [df_cnn, df_kompas, df_tempo, df_turnbackhoax, df_hoax]:
    df.dropna(subset=["cleaned"], inplace=True)
    df["cleaned"] = df["cleaned"].astype(str)

# ---------------------------------------------------------------- preprocessing


def pad_punct(text):
    text = re.sub(f"([{re.escape(string.punctuation)}])", r" \1 ", text)
    text = re.sub(r"[\xa0\n\t]", " ", text)
    text = re.sub(r" +", " ", text).strip()
    return text


def clean_prefix(text):
    return text.replace("Penjelasan : ", "")


for df in [df_cnn, df_kompas, df_tempo, df_turnbackhoax, df_hoax]:
    df["cleaned"] = df["cleaned"].apply(pad_punct)
df_hoax["cleaned"] = df_hoax["cleaned"].apply(clean_prefix)

# ---------------------------------------------------------------- labels (binary)
fact_cols = [df[["cleaned", "label"]].copy()
             for df in [df_cnn, df_kompas, df_tempo]]
tb = df_turnbackhoax[["cleaned", "label"]
                     ].copy()          # label col == 1 (hoax)
ho = df_hoax[["cleaned"]].copy()
ho["label"] = 1

df_all = pd.concat(fact_cols + [tb, ho], ignore_index=True)
# keep only well-formed binary labels
df_all = df_all[df_all["label"].isin([0, 1])]
print("Label distribution:\n", df_all["label"].value_counts())

# ---------------------------------------------------------------- dataset
raw_ds = Dataset.from_pandas(df_all)
raw_ds = raw_ds.cast_column("label", ClassLabel(
    num_classes=2, names=["Fact", "Hoax"]))

tt = raw_ds.train_test_split(
    test_size=0.2, seed=42, stratify_by_column="label")
vv = tt["test"].train_test_split(
    test_size=0.5, seed=42, stratify_by_column="label")
ds_raw = DatasetDict(
    {"train": tt["train"], "val": vv["train"], "test": vv["test"]})
print(ds_raw)

# ---------------------------------------------------------------- tokenize
tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p2")


def tokenize_ds(data):
    return tokenizer(data["cleaned"], padding=True, truncation=True, max_length=256)


ds_full = ds_raw.map(tokenize_ds, batched=True).remove_columns(["cleaned"])

# ---------------------------------------------------------------- model (2-class)
id2label = {0: "Fact", 1: "Hoax"}
label2id = {"Fact": 0, "Hoax": 1}
config = AutoConfig.from_pretrained(
    "indobenchmark/indobert-base-p2",
    num_labels=2,
    id2label=id2label,
    label2id=label2id,
)
model = AutoModelForSequenceClassification.from_pretrained(
    "indobenchmark/indobert-base-p2", config=config
).to(DEVICE)

# ---------------------------------------------------------------- metrics
metric_acc = evaluate.load("accuracy")
metric_others = evaluate.combine(["f1", "precision", "recall"])


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    acc = metric_acc.compute(predictions=preds, references=labels)
    others = metric_others.compute(
        predictions=preds, references=labels, average="macro")
    return {**acc, **others}


# ---------------------------------------------------------------- train
OUT_DIR = "Hoax-2class"
args = TrainingArguments(
    output_dir=OUT_DIR,
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    learning_rate=2e-5,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    greater_is_better=True,
    weight_decay=0.01,
    label_smoothing_factor=0.1,
    logging_steps=100,
    fp16=torch.cuda.is_available(),
    report_to="none",
    save_total_limit=2,
)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=ds_full["train"],
    eval_dataset=ds_full["val"],
    processing_class=tokenizer,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
)

print("=== Baseline (pre-training) ===")
print(trainer.evaluate())

print("=== Training ===")
trainer.train()

print("=== Test set ===")
print(trainer.evaluate(ds_full["test"]))

# ---------------------------------------------------------------- save
# saves config.json with num_labels=2 + id2label
trainer.save_model(OUT_DIR)
tokenizer.save_pretrained(OUT_DIR)
# keep only the best checkpoint, drop partial epoch dirs
for ckpt in glob.glob(f"{OUT_DIR}/checkpoint-*"):
    shutil.rmtree(ckpt, ignore_errors=True)

# ---------------------------------------------------------------- verify
clf = pipeline("text-classification", model=OUT_DIR,
               tokenizer=OUT_DIR, device=DEVICE)
samples = [
    "jakarta adalah ibu kota indonesia",
    "hari ini cuaca cerah di jakarta",
    "anies dekat dengan aliran sesat kristen papua",
    "presiden umumkan kebijakan pendidikan baru",
]
for s in samples:
    print(s[:40], "->", clf(s, truncation=True)[0])

# zip for easy transfer into Hoaks_Cls/models
shutil.make_archive(OUT_DIR, "zip", OUT_DIR)
print("DONE. Use:  unzip Hoax-2class.zip -d ../../models")
