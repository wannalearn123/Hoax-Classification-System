import re
import string

import torch
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
    return text.strip()


def predict(data):
    classifier = pipeline(
        "text-classification", model=model, tokenizer=tokenizer, device=device
    )
    result = classifier(data)
    return result
