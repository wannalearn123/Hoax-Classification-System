import requests
from bs4 import BeautifulSoup


def kompas(keyword):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    url = f"https://search.kompas.com/search?q={keyword}"
    r = requests.get(url, headers)
    soup = BeautifulSoup(r.text, "html.parser")
    articles = soup.find_all("div", class_="articleItem-box")
    for a in articles:
        a_title = a.h2.text.strip()
        a_text = a.p.text
        print(a_title, a_text)


def cnn_indo(keyword):
    pass


kompas("mbg")
# print(articles)
