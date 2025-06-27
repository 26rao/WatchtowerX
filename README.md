```markdown
# WatchtowerX

> A real-time AI-powered surveillance platform that detects fire, falls, and fights, stores events in MongoDB, and serves alerts via a React frontend.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16+  
- [npm](https://www.npmjs.com/)  
- A MongoDB Atlas cluster (or local MongoDB)  
- (Optional) Python 3.8+ for dummy ML script  

---

## 📁 Project Structure

```

WatchtowerX/
├── backend/ # Express + MongoDB API
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API route handlers
│ ├── middleware/ # Centralized error handler
│ ├── utils/ # Snapshot upload stub
│ ├── .env.example # Copy to .env and configure
│ ├── API.md # Backend API reference
│ └── index.js # Server entrypoint
│
├── frontend/ # React + Vite + Tailwind UI
│ └── … # (Arnav’s code)
│
└── script/
└── ml/ # Python dummy-event generator
├── requirements.txt
└── send_dummy_event.py
````

---

## 🔧 Backend Setup

1. **Navigate**  
   ```bash
   cd WatchtowerX/backend
````

2. **Copy & configure**

   ```bash
   cp .env.example .env
   # Edit `.env`:
   # PORT=5000
   # MONGODB_URI=<your-mongodb-atlas-uri>
   # (Optional) API_KEY, FCM_SERVER_KEY
   ```
3. **Install dependencies**

   ```bash
   npm install
   ```
4. **Run in development**

   ```bash
   npm run dev
   ```
5. **Verify health check**

   ```bash
   curl http://localhost:5000/health
   # ➜ { "status":"OK", "timestamp":"…" }
   ```

---

## 📑 Backend API

See detailed [API.md](backend/API.md).
Quick examples:

* **POST** `/api/event`

  ```bash
  curl -X POST http://localhost:5000/api/event \
    -H "Content-Type: application/json" \
    -d '{
      "eventType":"fire",
      "timestamp":"2025-06-26T12:00:00Z",
      "priority":3,
      "cameraId":"cam1",
      "location":"Main Gate"
    }'
  ```
* **GET** `/api/events?limit=5&sort=timestamp&order=desc`

  ```bash
  curl "http://localhost:5000/api/events?limit=5&sort=timestamp&order=desc"
  ```

---

## 💻 Frontend Setup

1. **Navigate**

   ```bash
   cd WatchtowerX/frontend
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Run development server**

   ```bash
   npm run dev
   ```
4. **Open in browser**

   ```
   http://localhost:5173
   ```

---

## 🐍 Dummy ML Event Generator

(Optional, to test without the real model)

1. **Navigate**

   ```bash
   cd WatchtowerX/script/ml
   ```
2. **Create & activate venv**

   ```bash
   python -m venv venv
   # Git Bash:
   source venv/Scripts/activate
   # PowerShell:
   .\venv\Scripts\Activate.ps1
   ```
3. **Install Python deps**

   ```bash
   pip install -r requirements.txt
   ```
4. **Send a dummy event**

   ```bash
   python send_dummy_event.py --type fire --camera cam1 --location "Main Gate"
   ```

---

## 🛠️ What’s Next (Backend)

* Integrate real ML payload (add `confidence`, `snapshotUrl`)
* Swap stub upload in `utils/upload.js` for real storage (Supabase/S3)
* (Optional) Trigger Firebase Cloud Messaging via `FCM_SERVER_KEY`
* Finalize documentation and add advanced filters

---

## 📄 License

MIT © 2025 WatchtowerX Team

```
