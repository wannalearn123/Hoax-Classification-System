import io
import socket
import string
import pytesseract
from classifier import classify, clean, q_extractor, verify
from fastapi import Body, FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fetch import cnn_indo
import logger
from PIL import Image

# logger

app = FastAPI()

hostname = socket.gethostname()
ip_address = socket.gethostbyname(hostname)

origins = ["http://localhost:3000",
           "http://127.0.0.1:3000", f"http://{ip_address}:3000"]

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
    word = clean(payload)
    classified = classify(word)[0]
    query = q_extractor(word)
    news = cnn_indo(query)
    verif = "Yes" if verify(query, news) else "No"
    score = classified["score"] * 100

    if classified["label"] == "LABEL 0":
        result = "Fact"
    else:
        result = "Hoax"

    return {
        "structure": result,
        "score": int(score),
        "verification": verif,
    }


@app.post("/predict_pict")
async def classify_hoax_pict(file: UploadFile):
    try:
        content = await file.read()
        img = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(img)
        if not text:
            return {"error": "picture is not relevant"}
        classified = classify(text)[0]
        score = classified["score"] * 100

        query = q_extractor(clean(text))
        news = cnn_indo(query)
        verif = "Yes" if verify(query, news) > 0.7 else "No"

        if classified["label"] == "LABEL_0":
            result = "Fact"
        else:
            result = "Hoax"

        return {
            "structure": result,
            "score": int(score),
            "verification": verif,
        }
    except:
        return {"error": "wrong data type"}


@app.post("/extract_word")
async def extract_word(file: UploadFile):
    content = await file.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    return clean(text)
