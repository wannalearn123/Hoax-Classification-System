import io

import pytesseract
from fastapi import Body, FastAPI, UploadFile
from PIL import Image

from classifier import keyword, predict, preprocessing, verify
from fetch import cnn_indo, kompas

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/predict_word")
async def predict_hoax(payload: str = Body(media_type="text/plain")):
    result = preprocessing(payload)
    result = predict(result)
    return {"structure": result}


@app.post("/predict_pict")
async def predict_hoax_pict(payload: UploadFile):
    content = await payload.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    text = preprocessing(text)
    pred = predict(text)[0]

    key = keyword(text)
    news = cnn_indo(key)
    news = [preprocessing(n) for n in news]
    verif = verify(text, news)
    return {"prediction": pred["label"], "score": pred["score"], "verification": verif}
