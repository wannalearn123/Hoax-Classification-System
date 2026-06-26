import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline


class ModelClassifier:
    model_path = "../../models"

    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    classifier = pipeline(
        "text-classification",
        model=model,
        tokenizer=tokenizer,
        device=device,
    )
