import io
import socket
import pytesseract
from PIL import Image

from classifier import classify, clean, q_extractor, validate
from fastapi import Body, FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fetch import cnn_indo
# import logger

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

# verification through text


@app.post("/predict_word")
async def classify_hoax(payload: str = Body(media_type="text/plain")):
    word = clean(payload)
    classified = classify(word)[0]
    query = q_extractor(word)
    news = cnn_indo(query)
    cross_val = "Yes" if validate(query, news) else "No"
    score = classified["score"] * 100
    result = classified["label"]

    return {
        "classification": result,
        "score": int(score),
        "validation": cross_val,
    }


# verification through picture
@app.post("/predict_pict")
async def classify_hoax_pict(file: UploadFile):
    try:
        content = await file.read()
        img = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(img)
        if not text:
            return {"error": "no text detected"}
        classified = classify(text)[0]
        score = classified["score"] * 100

        query = q_extractor(clean(text))
        news = cnn_indo(query)
        cross_val = "Yes" if validate(query, news) > 0.7 else "No"
        result = classified['label']

        return {
            "classification": result,
            "score": int(score),
            "validation": cross_val,
        }
    except:
        return {"error": "wrong data type"}


@app.post("/extract_word")
async def extract_word(file: UploadFile):
    content = await file.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    return clean(text)
