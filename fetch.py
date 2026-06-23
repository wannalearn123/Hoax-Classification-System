import re

import requests
from bs4 import BeautifulSoup


def kompas(keyword):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    url = f"https://search.kompas.com/search?q={keyword}"
    r = requests.get(url, headers)
    soup = BeautifulSoup(r.text, "html.parser")
    articles = soup.find_all("div", class_="articleItem-box")
    result = []
    for a in articles:
        a_title = a.h2.text.strip()
        a_text = a.p.text
        result.append(f"{a_title}, {a_text}")
    return result


def cnn_indo(keyword):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "application/json",
    }
    url = f"https://www.cnnindonesia.com/api/v3/search?query={keyword}"
    r = requests.get(url, headers=headers)
    data = r.json()["data"]
    result = []
    for d in data:
        result.append(f"{d['strjudul']}, {d['strringkasan']}")
    return result


# print(kompas("ekonomi"))
# print(cnn_indo("ekonomi"))
