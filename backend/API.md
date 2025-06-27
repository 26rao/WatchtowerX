
---
### 2. Updated `API.md`

````markdown
# WatchtowerX Backend API Reference

_All endpoints accept and return JSON. `Content-Type: application/json` required for POST._

---

## 1. Health Check

**GET** `/health`  
**Response** `200 OK`  
```json
{
  "status": "OK",
  "timestamp": "2025-06-27T12:34:56.789Z"
}
````

---

## 2. Create Event

**POST** `/api/event`
**Purpose**: Ingest a new surveillance event.

### Request

```http
POST http://<host>:<port>/api/event
Content-Type: application/json

{
  "eventType": "fire",         // Required: "fire" | "fall" | "fight"
  "timestamp": "2025-06-26T12:00:00Z", // Required: ISO 8601
  "priority": 1,               // Required: integer
  "cameraId": "cam1",          // Required: string
  "location": "Main Gate",     // Optional: string
  "severity": "high",          // Optional: "low" | "medium" | "high"
  "status": "dispatched",      // Optional: "pending" | "dispatched" | "resolved"
  "notes": "Detected by cam1", // Optional: string
  "base64Image": "data:image/png;base64,..." // Optional: triggers snapshot upload
}
```

### Response

* **201 Created**

  ```json
  {
    "success": true,
    "event": {
      "eventId": "60f8f0f0f0f0f0f0f0f0f0",
      "eventType": "fire",
      "timestamp": "2025-06-26T12:00:00.000Z",
      "location": "Main Gate",
      "severity": "high",
      "status": "dispatched",
      "notes": "Detected by cam1",
      "snapshotUrl": "https://via.placeholder.com/300x200.png?text=Snapshot"
    }
  }
  ```

* **400 Bad Request**

  ```json
  { "error": "\"eventType\" is required" }
  ```

* **500 Internal Server Error**

  ```json
  { "error": "Internal Server Error" }
  ```

---

## 3. List Events

**GET** `/api/events`
**Purpose**: Retrieve stored events with filtering, sorting, and pagination.

### Query Parameters

| Name        | Type    | Default     | Description                                         |
| ----------- | ------- | ----------- | --------------------------------------------------- |
| `type`      | string  | *none*      | Filter by `eventType` ("fire", "fall", "fight")     |
| `priority`  | integer | *none*      | Filter by priority level                            |
| `cameraId`  | string  | *none*      | Filter by camera identifier                         |
| `limit`     | integer | 50          | Max number of events to return                      |
| `page`      | integer | 1           | Page number for pagination                          |
| `startDate` | string  | *none*      | ISO date to start filter (`timestamp >= startDate`) |
| `endDate`   | string  | *none*      | ISO date to end filter (`timestamp <= endDate`)     |
| `sort`      | string  | `timestamp` | Field to sort by (`timestamp`, `priority`, etc.)    |
| `order`     | string  | `desc`      | Sort order: `asc` or `desc`                         |

### Example

```bash
curl "http://localhost:5000/api/events?type=fire&limit=10&sort=timestamp&order=asc"
```

### Response

* **200 OK**

  ```json
  {
    "page": 1,
    "limit": 10,
    "events": [
      {
        "eventId": "60f8f0f0f0f0f0f0f0f0f0",
        "eventType": "fire",
        "timestamp": "2025-06-26T12:00:00.000Z",
        "location": "Main Gate",
        "severity": "high",
        "status": "dispatched",
        "notes": "Detected by cam1",
        "snapshotUrl": null
      },
      {
        // ...
      }
    ]
  }
  ```

---

## 4. Bulk Delete

**DELETE** `/api/events?olderThan=YYYY-MM-DD`
**Purpose**: Delete events older than the specified date.

### Example

```bash
curl -X DELETE "http://localhost:5000/api/events?olderThan=2025-01-01"
```

### Response

* **200 OK**

  ```json
  { "deletedCount": 42 }
  ```

* **400 Bad Request**

  ```json
  { "error": "Query param `olderThan` is required" }
  ```

---

## 5. Export Events as CSV

**GET** `/api/events/export`
**Purpose**: Download all events in CSV format.

### Example

```bash
curl "http://localhost:5000/api/events/export" -o events.csv
```

### Response

* **200 OK** with `Content-Type: text/csv`, attachment `events.csv`.

---

## 6. Error Handling

* Validation errors → **400** with `{ "error": "message" }`
* Server errors → **500** with `{ "error": "Internal Server Error" }`

---

### Notes

* `snapshotUrl` is `null` when no image is provided; frontend will show a placeholder.
* Base64 image uploads are stubbed to return a placeholder URL.
* All new fields (`severity`, `status`, `notes`) have defaults if omitted.
* Query parameter `type` maps to `eventType` on the backend.
* For any discrepancies, check server logs or reach out to the backend maintainer.

```

---

