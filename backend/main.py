import io

import pytesseract
from classifier import classify, clean, q_extractor, verify
from fastapi import Body, FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fetch import cnn_indo
from PIL import Image

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"title": "Classifying Hoax through Text & Image"}


@app.post("/predict_word")
async def classify_hoax(payload: str = Body(media_type="text/plain")):
    result = classify(payload)[0]
    query = q_extractor(clean(payload))
    news = cnn_indo(query)
    verif = verify(query, news)
    return {
        "structure": result["label"],
        "score": result["score"],
        "verification": verif,
    }


@app.post("/predict_pict")
async def classify_hoax_pict(file: UploadFile):
    content = await file.read()
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
