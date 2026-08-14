import re
import string
import torch
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_DIR = "../../models"

# _MODEL = AutoModelForSequenceClassification.from_pretrained( "wanna-learn123/Hoax-Classification")
MODEL = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
# e file claimed /predict_word matches "LABEL 0" (space) and /predict_pict matches "LABEL_0" (underscore). Bu_TOKENIZER = AutoTokenizer.from_pretrained( "wanna-learn123/Hoax-Classification")
TOKENIZER = AutoTokenizer.from_pretrained(MODEL_DIR)

_SEED = 42
torch.manual_seed(_SEED)


def clean(text: str) -> str:
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(r"[\xa0\n\t]", " ", text)
    text = re.sub(r" +", " ", text).strip()
    return text


def classify(data: str):
    classifier = pipeline(
        "text-classification",
        model=MODEL,
        tokenizer=TOKENIZER,
        device=DEVICE,
    )
    result = classifier(data, truncation=True)
    return result


def q_extractor(text: str):
    import yake

    # Words that add no discriminative power to a news search query.
    generic = {
        "baru", "mulai", "melayani", "akan", "untuk", "dari", "yang",
        "dengan", "dalam", "pada", "ini", "itu", "sudah", "juga", "tidak",
        "pemerintah", "menjadi", "adanya", "tersebut", "kembali",
        "besar", "ibu", "kota", "sangat", "karena", "setelah",
    }

    extractor = yake.KeywordExtractor(lan="id", max_ngram_size=2, top=8)
    key = extractor.extract_keywords(text)

    # keep the highest-scored phrase and skip any that shares a token with one already kept.
    kept = []
    used = set()
    for kw, _score in key:
        toks = kw.split()
        if set(toks) & used:
            continue
        if all(t in generic for t in toks):
            continue
        used |= set(toks)
        kept.append(kw)
        if len(used) >= 6:
            break

    return "+".join(kept)


def embedding(text):
    cleaned = clean(text)
    inputs = TOKENIZER(
        cleaned,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
    ).to(DEVICE)
    with torch.no_grad():
        outputs = MODEL.bert(**inputs)
        vec_cls = outputs.last_hidden_state[:, 0, :]
        vec_point = F.normalize(vec_cls, p=2, dim=1)
    return vec_point


def validate(text, news):
    if not news:
        return 0.00
    vec1 = embedding(text)
    vec2 = torch.stack([embedding(v) for v in news])
    sim = F.cosine_similarity(vec1, vec2, dim=1)
    return sim.max().item()
