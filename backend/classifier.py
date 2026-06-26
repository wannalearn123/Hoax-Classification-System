import re
import string

import torch
import torch.nn.functional as F
from model_pipe import ModelClassifier


def clean(text):
    text = text.translate(str.maketrans("", "", string.punctuation))
    text = re.sub(" +", " ", text)
    text = re.sub("[\xa0\n]", " ", text)
    return text.strip().lower()


def classify(data):
    pipe = ModelClassifier()
    result = pipe.classifier(data)
    return result


def q_extractor(text):
    import yake

    extractor = yake.KeywordExtractor(lan="id", max_ngram_size=3, top=3)
    key = extractor.extract_keywords(text)
    word = [kw[0] for kw in key]
    word_text = " ".join(word).split()
    word_text = set(word_text)
    return "+".join(word_text)


def embedding(text):
    pipe = ModelClassifier()
    inputs = pipe.tokenizer(text, return_tensors="pt", max_length=512)
    with torch.no_grad():
        outputs = pipe.model.bert(**inputs)
        embeddings = outputs.last_hidden_state
    vec_cls = embeddings[:, 0, :]
    return F.normalize(vec_cls, p=2, dim=1)


def verify(text, news):
    if not news:
        return 0
    vec1 = embedding(text)
    vec2 = torch.stack([embedding(v) for v in news])
    sim = F.cosine_similarity(vec1, vec2, dim=1)
    return sim.mean().item()
