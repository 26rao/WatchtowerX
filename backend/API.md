````markdown
# WatchtowerX Backend API Reference

_All responses are JSON unless otherwise noted.  
_For POST bodies, set `Content-Type: application/json`._

---

## 1. Health Check

**GET** `/health`  
Returns a simple status & timestamp.

**Response** `200 OK`  
```json
{
  "status": "OK",
  "timestamp": "2025-06-29T12:34:56.789Z"
}
````

---

## 2. Create Event

**POST** `/api/event`
Ingest a new surveillance event from the ML model.

### Request Body

| Field           | Type   | Required? | Description                                                                                              |
| --------------- | ------ | --------- | -------------------------------------------------------------------------------------------------------- |
| `eventType`     | string | yes       | One of `fire`, `fall`, `fight`                                                                           |
| `timestamp`     | string | yes       | ISO 8601 date‑time                                                                                       |
| `cameraId`      | string | yes       | Identifier for the camera                                                                                |
| `confidence`    | number | yes       | Model’s confidence score (0.0–1.0)                                                                       |
| `priorityLabel` | string | yes       | ML‑assigned priority: `Low` \| `Medium` \| `High`                                                        |
| `snapshotData`  | string | yes       | Data URI (base64) of the event snapshot image                                                            |
| `eventDetails`  | object | no        | `{ description: string }` extra context (e.g. `"Detected fall pose"`). Falls back to `notes` if present. |
| `location`      | string | no        | Human‑readable location (default: `"Unknown"`)                                                           |
| `severity`      | string | no        | `"low"` \| `"medium"` \| `"high"` (default: `"medium"`)                                                  |
| `status`        | string | no        | `"pending"` \| `"dispatched"` \| `"resolved"` (default: `"pending"`)                                     |
| `notes`         | string | no        | Free‑form notes (max 512 chars). Falls back to `eventDetails.description` if present.                    |

### Example

```bash
curl -X POST http://localhost:5000/api/event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType":"fall",
    "timestamp":"2025-06-28T18:02:00Z",
    "cameraId":"CAM-04-Warehouse",
    "confidence":0.92,
    "priorityLabel":"High",
    "snapshotData":"data:image/jpeg;base64,/9j/4AAQ...",
    "eventDetails":{"description":"Detected fall pose"},
    "location":"Sector 7",
    "severity":"high",
    "status":"pending",
    "notes":"Person fell near gate"
  }'
```

### Responses

* **201 Created**

  ```json
  {
    "success": true,
    "event": {
      "eventId": "60f8f0f0f0f0f0f0f0f0f0",
      "eventType": "fall",
      "timestamp": "2025-06-28T18:02:00.000Z",
      "cameraId": "CAM-04-Warehouse",
      "confidence": 0.92,
      "priority": 3,
      "priorityLabel": "High",
      "location": "Sector 7",
      "severity": "high",
      "status": "pending",
      "notes": "Detected fall pose",
      "snapshotUrl": "https://your-bucket.s3.region.amazonaws.com/snapshots/uuid.png"
    }
  }
  ```

* **400 Bad Request**
  Validation errors:

  ```json
  { "error": "\"eventType\" is required" }
  ```

* **500 Internal Server Error**
  Upload or server errors:

  ```json
  { "error": "Snapshot upload failed" }
  ```

---

## 3. List Events

**GET** `/api/events`
Retrieve stored events with filtering, pagination, sorting.

### Query Parameters

| Name        | Type    | Default     | Description                                                    |
| ----------- | ------- | ----------- | -------------------------------------------------------------- |
| `type`      | string  | *none*      | Filter by `eventType`. Single or comma‑list: `fire,fall,fight` |
| `priority`  | string  | *none*      | Filter by numeric priority. Single or comma‑list: `1,2,3`      |
| `cameraId`  | string  | *none*      | Exact match on camera identifier                               |
| `location`  | string  | *none*      | Partial match on `location` using regex/text search            |
| `limit`     | integer | 50          | Max number of items returned                                   |
| `page`      | integer | 1           | Page number                                                    |
| `startDate` | string  | *none*      | ISO date to include events at or after this timestamp          |
| `endDate`   | string  | *none*      | ISO date to include events at or before this timestamp         |
| `sort`      | string  | `timestamp` | Field to sort by (e.g. `timestamp`, `priority`)                |
| `order`     | string  | `desc`      | Sort order: `asc` or `desc`                                    |

### Example

```bash
curl "http://localhost:5000/api/events?type=fire,fall&priority=2,3&location=Sector&limit=20&page=1&sort=priority&order=asc"
```

### Response

* **200 OK**

  ```json
  {
    "page": 1,
    "limit": 20,
    "events": [
      {
        "eventId": "60f8f0f0f0f0f0f0f0f0f0",
        "eventType": "fall",
        "timestamp": "2025-06-28T18:02:00.000Z",
        "cameraId": "CAM-04-Warehouse",
        "confidence": 0.92,
        "priority": 3,
        "priorityLabel": "High",
        "location": "Sector 7",
        "severity": "high",
        "status": "pending",
        "notes": "Detected fall pose",
        "snapshotUrl": "https://your-bucket.s3.region.amazonaws.com/snapshots/uuid.png"
      },
      { /* ... */ }
    ]
  }
  ```

---

## 4. Bulk Delete

**DELETE** `/api/events?olderThan=YYYY-MM-DDThh:mm:ssZ`
Delete all events older than the given timestamp.

### Example

```bash
curl -X DELETE "http://localhost:5000/api/events?olderThan=2025-01-01T00:00:00Z"
```

### Responses

* **200 OK**

  ```json
  { "deletedCount": 42 }
  ```

* **400 Bad Request**
  Missing param:

  ```json
  { "error": "Query param `olderThan` is required" }
  ```

---

## 5. Export Events as CSV

**GET** `/api/events/export`
Download all stored events as a CSV file.

### Example

```bash
curl "http://localhost:5000/api/events/export" -o events.csv
```

* **200 OK** with headers:

  ```
  Content-Type: text/csv
  Content-Disposition: attachment; filename="events.csv"
  ```

---

## 6. Export Events as JSON

**GET** `/api/events/export.json`
Retrieve all stored events as a raw JSON array.

### Example

```bash
curl "http://localhost:5000/api/events/export.json"
```

* **200 OK**

  ```json
  [
    {
      "eventId": "60f8f0f0f0f0f0f0f0f0f0",
      "eventType": "fall",
      "timestamp": "2025-06-28T18:02:00.000Z",
      "cameraId": "CAM-04-Warehouse",
      "confidence": 0.92,
      "priority": 3,
      "priorityLabel": "High",
      "location": "Sector 7",
      "severity": "high",
      "status": "pending",
      "notes": "Detected fall pose",
      "snapshotUrl": "https://your-bucket.s3.region.amazonaws.com/snapshots/uuid.png"
    },
    { /* … */ }
  ]
  ```

---

## 7. Error Handling

* **400 Bad Request**
  Validation errors return:

  ```json
  { "error": "<validation message>" }
  ```

* **500 Internal Server Error**
  Server or upload failures return:

  ```json
  { "error": "Internal Server Error" }
  ```

---

### Notes

* In **test** mode, `snapshotData` always returns the placeholder URL.
* Mongoose **indexes** are defined on `eventType + timestamp` and `priority`.
* A **cron** job runs daily at midnight to purge old events via `scripts/cleanupOldEvents.js`.
* Ensure `.env` includes:

  ```
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  AWS_REGION
  S3_BUCKET_NAME
  MONGODB_URI
  PLACEHOLDER_SNAPSHOT_URL
  ```


