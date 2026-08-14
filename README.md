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
└── linux_venv/       # Python virtual environment (backend)
```

> Model weights berada di **luar** repo, di `Hoaks_Cls/models` (di-load oleh `backend/classifier.py` via `../../models`).

---

## Prasyarat / Prerequisites

- **Python 3** virtualenv: gunakan `linux_venv/` yang sudah ada (atau buat baru).
- **Tesseract** terpasang di sistem (wajib untuk OCR gambar pada `/predict_pict`).
- **Bun** untuk frontend.
- **Model weights** di `Hoaks_Cls/models` — tanpa ini backend akan crash saat import.

---

## Menjalankan Backend / Running the Backend

```bash
cd backend
../linux_venv/bin/uvicorn main:app --reload
```

- Server berjalan di `http://127.0.0.1:8000`.
- Model dimuat saat import dari `../../models` (yaitu `Hoaks_Cls/models`).
- `/predict_word` memanggil API live CNN Indonesia, jadi **butuh koneksi internet**.

The backend runs on `http://127.0.0.1:8000`. The model loads at import time from `../../models` (i.e. `Hoaks_Cls/models`). News validation hits CNN Indonesia's live API, so an internet connection is required.

### Model Weights

Model dapat diperoleh dari dua cara:

1. **Unduh dari HuggingFace** (repo kamu / your repo) `wanna-learn123/Hoax-Classification`, lalu tempatkan isinya di `Hoaks_Cls/models`:
   ```bash
   cd Hoaks_Cls
   # download & extract the repo into models/
   ```
2. **Fine-tune sendiri** dengan `train_clean.py` (lihat bagian Training).

Dua opsi ini setara — `classifier.py` memuat dari `../../models` dan tokenizer/model dapat dimuat dari folder yang sama.

---

## Menjalankan Frontend / Running the Frontend

```bash
cd frontend
bun install
bun run dev        # bun --hot src/index.ts
```

- SPA tersedia di `http://localhost:3000`.
- Frontend memanggil backend hardcoded di `http://127.0.0.1:8000`.

Build produksi:

```bash
bun run build      # bun run build.ts
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

Data diambil via `kagglehub` (dataset fakta & hoax Indonesia). Hasil disimpan ke `Hoax-2class.zip`, lalu pindahkan ke `Hoaks_Cls/models`:

```bash
unzip Hoax-2class.zip -d ../../models
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
- Model mengeluarkan label **`Fact`** / **`Hoax`**; `/predict_word` & `/predict_pict` hanya melaporkan **Fact** bila `label == "fakta"`. Pastikan label model sesuai, jika tidak semua laporan menjadi **Hoax**.
- CORS backend hanya mengizinkan `localhost:3000`, `127.0.0.1:3000`, dan IP LAN.
