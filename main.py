import io

import pytesseract
from fastapi import Body, FastAPI, UploadFile
from PIL import Image

from classifier import predict, preprocessing
from fetch import cnn_indo, kompas

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/predict_word")
async def predict_hoax(payload: str = Body(media_type="text/plain")):
    result = preprocessing(payload)
    result = predict(result)
    return result


@app.post("/predict_pict")
async def predict_hoax_pict(payload: UploadFile):
    content = await payload.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    text = preprocessing(text)
    result = predict(text)
    return result


@app.post("/fetch")
async def fetch_news(payload: str = Body(media_type="text/plain")):
    result = cnn_indo(payload)
    result2 = kompas(payload)
    return result[0], result2[0]
