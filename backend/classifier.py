import re
import string

import torch
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_DIR = "../../models"

_MODEL = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
_TOKENIZER = AutoTokenizer.from_pretrained(MODEL_DIR)
_MODEL.eval()
_SEED = 42
torch.manual_seed(_SEED)


def clean(text: str) -> str:
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(" +", " ", text)
    text = re.sub("[\xa0\n]", " ", text)
    return text.strip().lower()


def classify(data: str):
    classifier = pipeline(
        "text-classification",
        model=_MODEL,
        tokenizer=_TOKENIZER,
        device=DEVICE,
    )
    result = classifier(data, truncation=True)
    return result


def q_extractor(text: str):
    import yake

    extractor = yake.KeywordExtractor(lan="id", max_ngram_size=3, top=3)
    key = extractor.extract_keywords(text)
    word = [kw[0] for kw in key]
    word_text = " ".join(word).split()
    word_text = set(word_text)
    return "+".join(word_text)


def embedding(text):
    cleaned = clean(text)
    inputs = _TOKENIZER(
        cleaned,
        return_tensors="pt",
        truncation=True,
        padding="max_length",
    ).to(DEVICE)
    with torch.no_grad():
        outputs = _MODEL.bert(**inputs)
        vec_cls = outputs.last_hidden_state[:, 0, :]
    return F.normalize(vec_cls, p=2, dim=1)


def verify(text, news):
    if not news:
        return 0.00
    vec1 = embedding(text)
    vec2 = torch.stack([embedding(v) for v in news])
    sim = F.cosine_similarity(vec1, vec2, dim=1)
    return sim.max().item()
