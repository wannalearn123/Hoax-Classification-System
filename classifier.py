import re
import string

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline


def preprocessing(text):
    for punct in string.punctuation:
        if punct in text:
            text = text.replace(punct, f" {punct} ")

    text = re.sub(" +", " ", text)
    text = re.sub("\n", " ", text)
    return text.strip()


def key_word():
    pass


def predict(data):
    model_path = "../models"

    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    classifier = pipeline(
        "text-classification", model=model, tokenizer=tokenizer, device=device
    )
    result = classifier(data)
    return result
