# AGENTS.md

Hoax classification web app: FastAPI backend + Bun/React frontend, using a fine-tuned IndoBERT model.

## Layout
- `backend/` — FastAPI app. Entry `main.py`; model/classification logic in `classifier.py`; news-verification scraping in `fetch.py`.
- `frontend/` — Bun web server (`src/index.ts`) serving a React SPA (`src/frontend.tsx` → `App.tsx` → `HoaxClassifier.tsx`).
- Git repo root is this `src/` dir. Big model zips and `models/` live in the parent (`Hoaks_Cls/`), outside the repo.
- `train_clean.py` at repo root is the fine-tuning script (pipeline training the `models/` weights).

## Running
Backend (Python venv is `linux_venv/`, not `venv/` — `venv/` is broken/empty):
```bash
cd backend
../linux_venv/bin/uvicorn main:app --reload
```
- Model weights load at import time from `../../models` (relative to `backend/`), i.e. `Hoaks_Cls/models`. That dir is NOT committed; the app crashes without it. Check `classifier.py:9`.
- `fetch.py` calls CNN Indonesia's live search API at request time, so verification needs internet.

Frontend:
```bash
cd frontend
bun run dev        # bun --hot src/index.ts
bun run build      # bun run build.ts
```
Tailwind v4 is wired through `bun-plugin-tailwind` (`bunfig.toml`), no separate PostCSS config.

## Gotchas
- Backend CORS only allows `localhost:3000` / `127.0.0.1:3000` and the LAN IP (`main.py:19`). Frontend calls the backend hardcoded at `http://127.0.0.1:8000` (`HoaxClassifier.tsx:5`).
- Both `/predict_word` and `/predict_pict` classify as Fact only when `label == "fakta"` (`main.py:45`, `main.py:72`) — verify the model actually emits a `"fakta"` label, otherwise everything reports Hoax.
- `/predict_pict` requires `tesseract` installed on the system for OCR.
- `logger.py` imports `logging` twice and writes `log.csv`; `log.csv` is committed.
- No tests. Typecheck: `tsc` via `bun` uses the strict `tsconfig.json`; no preconfigured lint.
