# Hoaks Classifier — Klasifikasi Hoax / Hoax Classification

Sistem Klasifikasi Hoax berbasis Web Single Page Application menggunakan machine learning classification untuk analisis struktur bahasa dan membandingkannya dengan sumber terpercaya menggunakan cosine similarity.

A single-page web app that classifies text as **Fact** or **Hoax** using a fine-tuned IndoBERT model, and cross-validates the claim against trusted news sources (CNN Indonesia) using cosine similarity.

---

## Fitur / Features

- **Klasifikasi Teks** / Text classification — klasifikasi hoax/fakta dari teks berbahasa Indonesia.
- **Klasifikasi Gambar** / Image classification — ekstraksi teks dari gambar via OCR (Tesseract) lalu klasifikasi.
- **Validasi Berita** / News validation — membandingkan kalimat kunci dengan berita CNN Indonesia (butuh internet / requires internet).

---

## Struktur Proyek / Project Structure

```
src/
├── backend/          # FastAPI app
│   ├── main.py       # endpoints (predict_word, predict_pict, extract_word)
│   ├── classifier.py # load model, clean text, classify, keyword & validate
│   ├── fetch.py      # CNN Indonesia search API
│   └── logger.py     # logging (write log.csv)
├── frontend/         # Bun + React SPA
│   └── src/          # index.ts (server), frontend.tsx, App.tsx, HoaxClassifier.tsx
├── train_clean.py    # fine-tuning script (Kaggle/Colab)
```

> Model weights berada di **luar** repo (di-load oleh `backend/classifier.py` via `../../models`).

---

## Prasyarat / Prerequisites

- **Python 3** + `fastapi` (install via `pip`, gunakan virtualenv kamu sendiri).
- **Tesseract** terpasang di sistem (wajib untuk OCR gambar pada `/predict_pict`) — unduh di 
https://github.com/tesseract-ocr/tesseract
- **JS package manager** — `bun`, `npm`, atau lainnya (untuk frontend).
- **Model weights** di folder model (di luar repo) — tanpa ini backend akan crash saat import.

---

## Instalasi Dependensi Backend / Installing Backend Dependencies

Semua paket Python backend tercantum di `backend/requirements.txt`. Sebaiknya gunakan virtualenv agar tidak mengganggu Python sistem.

Recommended — create & activate a virtualenv, then install:

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Paket yang terpasang / Installed packages (versi di-pin di `requirements.txt`):

| Paket | Fungsi |
|-------|--------|
| `fastapi` | Framework API / web framework |
| `uvicorn[standard]` | ASGI server (jalankan `fastapi dev` / run the app) |
| `torch` | PyTorch runtime untuk model |
| `transformers` | Memuat model & tokenizer HuggingFace |
| `yake` | Ekstraksi kata kunci untuk query berita |
| `requests` | Memanggil API CNN Indonesia |
| `beautifulsoup4` | Parsing HTML (scraper `kompas`) |
| `pytesseract` | OCR via Tesseract |
| `pillow` | Membaca gambar pada `/predict_pict` |
| `python-multipart` | Parsing upload file (UploadFile) |

> `tesseract` (sistem, bukan pip) juga wajib untuk OCR — lihat bagian Prasyarat.
> Transitive deps (`regex`, `tokenizers`, `safetensors`, `huggingface-hub`, `numpy`) ikut terinstal otomatis lewat `torch`/`transformers`.

Periksa / Verify the install:

```bash
pip show fastapi torch transformers yake
```

---

## Menjalankan Backend / Running the Backend

```bash
cd backend
fastapi run            # atau: fastapi dev  (auto-reload)
```

- Server berjalan di `http://127.0.0.1:8000`.
- Model dimuat saat import dari `../../models` (relatif terhadap `backend/`, berada di luar repo).
- `/predict_word` memanggil API live CNN Indonesia, jadi **butuh koneksi internet**.

Use `fastapi dev` for auto-reload during development. The backend runs on `http://127.0.0.1:8000`. The model loads at import time from `../../models` (relative to `backend/`, outside the repo). News validation hits CNN Indonesia's live API, so an internet connection is required.

### Model Weights

Model dapat diperoleh dari dua cara:

1. **Unduh dari HuggingFace** — https://huggingface.co/wanna-learn123/Hoax-Classification, lalu tempatkan isinya di folder model yang dimuat `classifier.py`:
   ```bash
   cd backend
   # download & extract the repo into ../../models
   ```
2. **Fine-tune sendiri** dengan `train_clean.py` (lihat bagian Training).

Dua opsi ini setara — `classifier.py` memuat dari `../../models` dan tokenizer/model dapat dimuat dari folder yang sama.

---

## Menjalankan Frontend / Running the Frontend

```bash
cd frontend
bun install        # atau: npm install  /  yarn / pnpm
bun run dev        # npm run dev (jalankan skrip "dev")
```

- SPA dapat diakses melalui port 3000 (mis. `http://localhost:3000` atau IP LAN).
- Frontend memanggil backend di `http://<hostname>:8000` (hostname halaman yang sama, lihat `HoaxClassifier.tsx:74`).

Build produksi:

```bash
bun run build      # atau: npm run build
```

---

## API Endpoints

| Method | Path            | Deskripsi                                   |
|--------|-----------------|---------------------------------------------|
| GET    | `/`             | Info aplikasi                               |
| POST   | `/predict_word` | Klasifikasi teks + validasi berita          |
| POST   | `/predict_pict` | Klasifikasi dari gambar (OCR) + validasi    |
| POST   | `/extract_word` | Ekstraksi teks dari gambar (OCR)            |

Contoh `/predict_word`:

```bash
curl -X POST http://127.0.0.1:8000/predict_word \
     -H "Content-Type: text/plain" \
     -d "Jakarta adalah ibu kota Indonesia"
```

Respon:

```json
{
  "classification": "Fact",
  "score": 87,
  "validation": "Yes"
}
```

---

## Training Model / Training the Model

Skrip `train_clean.py` melatih model 2-kelas (Fact/Hoax) berbasis `indobenchmark/indobert-base-p2`, menjalankan di Kaggle/Colab dengan GPU runtime:

```python
!python train_clean.py
```

Data diambil via `kagglehub` (dataset fakta & hoax Indonesia). Hasil disimpan ke `Hoax-2class.zip`, lalu unzip dan tempatkan ke folder model yang dimuat backend (`../../models` relatif dari `backend/`):

```bash
unzip Hoax-2class.zip -d <folder-model>
```

---

## Tech Stack

**Frontend** — Bun, React, Lucide-React, Tailwind CSS.

**Backend** — FastAPI, PyTorch (Torch), HuggingFace Transformers, Requests, Tesseract & Pytesseract, Pillow, Yake, String/Regex, io.

**Model Training** — Kagglehub, Torch, HuggingFace Transformers/Datasets/Evaluate, Pandas, NumPy, Scikit-learn, IndoBERT (`indobenchmark/indobert-base-p2`).

---

## Catatan Penting / Notes

- `tesseract` wajib terpasang untuk `/predict_pict` (OCR).
- Backend **crash** jika `Hoaks_Cls/models` tidak ada — model dimuat saat import.
- Label model **`Fact`** / **`Hoax`** (lihat `train_clean.py`) diteruskan langsung ke respons, tanpa pemeriksaan label tambahan.
- CORS backend hanya mengizinkan origin port `3000` pada host lokal/LAN yang dikonfigurasi di `main.py`.
