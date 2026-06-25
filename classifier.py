import re
import string

import torch
import torch.nn.functional as F
import yake
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

model_path = "../models"

model = AutoModelForSequenceClassification.from_pretrained(model_path)
tokenizer = AutoTokenizer.from_pretrained(model_path)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def preprocessing(text):
    for punct in string.punctuation:
        if punct in text:
            text = text.replace(punct, f" {punct} ")

    text = re.sub(" +", " ", text)
    text = re.sub("[\xa0\n]", " ", text)
    return text.strip().lower()


def predict(data):
    classifier = pipeline(
        "text-classification", model=model, tokenizer=tokenizer, device=device
    )
    result = classifier(data)
    return result


def keyword(text):
    extractor = yake.KeywordExtractor(lan="id", max_ngram_size=3, top=3)
    key = extractor.extract_keywords(text)
    word = [kw[0] for kw in key]
    word_text = " ".join(word).split(" ")
    word_text = set(word_text)
    return "+".join(word_text)


def embedding(text):
    input = tokenizer(text, return_tensors="pt", max_length=512)
    with torch.no_grad():
        outputs = model.bert(**input)
        embeddings = outputs.last_hidden_state
    vec_cls = embeddings[:, 0, :]
    return F.normalize(vec_cls, p=2, dim=1)


def verify(text, news):
    try:
        vec1 = embedding(text)
        vec2 = [embedding(v) if news else 0 for v in news]
        vec2_stack = torch.stack(vec2)
        sim = F.cosine_similarity(vec1, vec2_stack, dim=1)
        return sim.mean().item()
    except:
        return 0
