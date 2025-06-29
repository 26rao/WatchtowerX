```markdown
# WatchtowerX

> A real‑time AI‑powered surveillance platform that detects fire, falls, and fights, stores events in MongoDB, uploads snapshots to S3, and serves alerts via a React frontend.

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16+  
- [npm](https://www.npmjs.com/)  
- MongoDB Atlas (or local MongoDB)  
- AWS S3 bucket & credentials  
- (Optional) Python 3.8+ for dummy ML script  

---

## 📁 Project Structure

```

WatchtowerX/
├── backend/             # Express + MongoDB + S3 API
│   ├── models/          # Mongoose schemas (+ indexes)
│   ├── routes/          # API route handlers
│   ├── middleware/      # error handler, sanitizers
│   ├── utils/           # `upload.js` (S3 upload)
│   ├── scripts/         # cleanupOldEvents.js
│   ├── .env.example     # copy → .env & configure
│   ├── swagger.yaml     # OpenAPI spec
│   ├── API.md           # Backend reference
│   └── index.js         # Server entrypoint + cron
│
├── frontend/            # React + Vite + Tailwind UI
│   └── …                # (Arnav’s code)
│
└── script/
└── ml/              # Python dummy‑event generator
├── requirements.txt
└── send\_dummy\_event.py

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
   ```

   Fill in `.env`:

   ```env
   PORT=5000
   MONGODB_URI=<your‑mongodb‑uri>
   PLACEHOLDER_SNAPSHOT_URL=https://via.placeholder.com/300x200.png?text=Snapshot
   AWS_REGION=<your-aws-region>
   S3_BUCKET_NAME=<your-s3-bucket-name>
   AWS_ACCESS_KEY_ID=<your-access-key>
   AWS_SECRET_ACCESS_KEY=<your-secret-key>
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

Detailed spec in [API.md](backend/API.md) and interactive docs at:

```
http://localhost:5000/api-docs
```

### Key Endpoints

* **POST** `/api/event`
  Create a new event (with base64 snapshot → S3 URL).

  ```bash
  curl -X POST http://localhost:5000/api/event \
    -H "Content-Type: application/json" \
    -d @event.json
  ```

* **GET** `/api/events`
  List events, with pagination, sort & filters:

  | Query Param     | Description                        |
  | --------------- | ---------------------------------- |
  | `limit`, `page` | Pagination                         |
  | `type`          | Single or comma‑list (`fire,fall`) |
  | `priority`      | Single or comma‑list (`1,2,3`)     |
  | `location`      | Partial match (regex/text search)  |
  | `cameraId`      | Exact match                        |
  | `startDate`     | ISO date (≥)                       |
  | `endDate`       | ISO date (≤)                       |
  | `sort`, `order` | e.g. `?sort=timestamp&order=asc`   |

* **GET** `/api/events/export`
  CSV download of all events.

* **GET** `/api/events/export.json`
  JSON array of all events.

* **DELETE** `/api/events?olderThan=<ISO-date>`
  Bulk delete events older than given timestamp.

---

## 🗃️ Data Retention & Indexes

* **Indexes** (defined in Mongoose):

  ```js
  EventSchema.index({ eventType: 1, timestamp: -1 });
  EventSchema.index({ priority: 1 });
  ```
* **Cleanup**
  A daily cron job (`0 0 * * *`) runs `scripts/cleanupOldEvents.js` to purge old data.

---

## 🐍 Dummy ML Event Generator

*(Optional)* to test without a real model:

```bash
cd WatchtowerX/script/ml
python -m venv venv
source venv/Scripts/activate     # (or PowerShell: .\venv\Scripts\Activate.ps1)
pip install -r requirements.txt
python send_dummy_event.py --type fall --camera CAM-01 --location "Sector 7"
```

---

## 🛠️ What’s Next (Backend)

* Swap in any additional storage or messaging hooks (e.g. FCM).
* Add more advanced filters or XLSX export if needed.
* Keep `swagger.yaml` & `API.md` in sync with code.

---

## 📄 License

MIT © 2025 WatchtowerX Team

```
```
