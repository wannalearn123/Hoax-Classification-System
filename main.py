import io

import pytesseract
from fastapi import Body, FastAPI, UploadFile
from PIL import Image

from classifier import predict, preprocessing

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/predict_word")
async def predict_hoax(payload: str = Body(None, media_type="text/plain")):
    result = preprocessing(payload)
    result = predict(result)
    return {"received": result}


@app.post("/predict_pict")
async def predict_hoax_pict(payload: UploadFile):
    content = await payload.read()
    img = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(img)
    text = preprocessing(text)
    result = predict(text)
    return result
