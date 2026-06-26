import io

import pytesseract
from classifier import classify, clean, q_extractor, verify
from fastapi import Body, FastAPI, UploadFile
from fetch import cnn_indo
from PIL import Image

app = FastAPI()


@app.get("/")
def read_root():
    return {"title": "Hoax Classifier through text & image"}


@app.post("/predict_word")
async def classify_hoax(payload: str = Body(media_type="text/plain")):
    result = clean(payload)
    result = classify(payload)
    return {"structure": result}


@app.post("/predict_pict")
async def classify_hoax_pict(payload: UploadFile):
    content = await payload.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    result = classify(text)[0]

    query = q_extractor(clean(text))
    news = cnn_indo(query)
    verif = verify(query, news)
    return {
        "structure": result["label"],
        "score": result["score"],
        "verification": verif,
    }


@app.post("/extract_word")
async def extract_word(file: UploadFile):
    content = await file.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    return text
