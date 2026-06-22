# from tkinter import filedialog

# import pytesseract
# import torch
# from PIL import Image

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# result = filedialog.askopenfilename()
# result = Image.open(result)
# result = pytesseract.image_to_string(result)
# print(result)

from newsapi import NewsApiClient

newsapi = NewsApiClient(api_key="54aa7e7cef644f86873fd934d06480a2")

top_headlines = newsapi.get_top_headlines(
    q="bitcoin",
    category="business",
    language="en",
    country="us",
)

print(top_headlines)
