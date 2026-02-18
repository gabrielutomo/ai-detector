# AI Image Detector 🔍

Web app untuk mendeteksi apakah sebuah gambar dibuat oleh **AI** atau merupakan **gambar nyata**, menggunakan **Convolutional Neural Network (CNN)**.

**© 2025 Gabriel Adetya Utomo**

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Backend | Python FastAPI, TensorFlow/Keras |
| Model | CNN (Conv2D + BatchNorm + Dropout) |
| Dataset | [CIFAKE - Kaggle](https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images) |

---

## Cara Menjalankan

### 1. Setup Backend (Python)

```bash
cd backend
pip install -r requirements.txt
```

**Setup Kaggle API** (untuk download dataset):
1. Login ke [kaggle.com](https://kaggle.com) → Account → API → Create New Token
2. Simpan `kaggle.json` ke `C:\Users\<username>\.kaggle\kaggle.json`

**Training model CNN:**
```bash
python train_model.py
# Proses: download dataset → training (~10-30 menit) → simpan model ke model/cnn_model.h5
```

**Jalankan server:**
```bash
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend (Next.js)

```bash
# Di root project
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Struktur Project

```
ai-detector/
├── app/
│   ├── api/detect/route.ts   # Next.js API proxy ke backend
│   ├── globals.css           # Design system (dark theme)
│   ├── layout.tsx
│   └── page.tsx              # Halaman utama (drag & drop UI)
├── backend/
│   ├── main.py               # FastAPI server
│   ├── train_model.py        # Script training CNN
│   ├── requirements.txt
│   └── model/
│       └── cnn_model.h5      # Model tersimpan (setelah training)
└── README.md
```

---

## Arsitektur CNN

```
Input (64×64×3)
  → Conv2D(32) + BN + Conv2D(32) + BN + MaxPool + Dropout(0.25)
  → Conv2D(64) + BN + Conv2D(64) + BN + MaxPool + Dropout(0.25)
  → Conv2D(128) + BN + Conv2D(128) + BN + MaxPool + Dropout(0.4)
  → Flatten → Dense(256) + BN + Dropout(0.5)
  → Dense(1, sigmoid)  ← 0=Real, 1=AI
```

## API Endpoint

```
POST /predict
Content-Type: multipart/form-data
Body: file=<image>

Response:
{
  "label": "AI Generated" | "Real Image",
  "confidence": 0.92,
  "raw_score": 0.92,
  "is_ai": true
}
```
