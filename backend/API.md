````markdown
# Backend API Reference

This document describes the REST API endpoints for the WatchtowerX backend service.

---

## Authentication & Headers

- No authentication required for now.
- All endpoints accept and return JSON.
- Content-Type header for POST requests must be set to `application/json`.

---

## 1. Health Check

**Endpoint**: `GET /health`

**Purpose**: Verify the server is running.

**Response**

- Status: `200 OK`
- Body:
  ```json
  {
    "status": "OK",
    "timestamp": "2025-06-27T12:34:56.789Z"
  }
  ```
````

---

## 2. Create Event

**Endpoint**: `POST /api/event`

**Purpose**: Ingest a new surveillance event.

### Request

- **URL**: `http://<host>:<port>/api/event`
- **Headers**:

  ```
  Content-Type: application/json
  ```

- **Body**:

  ```json
  {
    "eventType": "fire", // Required. One of: "fire", "fall", "fight"
    "timestamp": "2025-06-26T12:00:00Z", // Required. ISO 8601 format
    "priority": 1, // Required. Integer 1 (low) to 3 (high)
    "cameraId": "cam1", // Required. Unique camera identifier
    "location": "Main Gate", // Optional. Human-readable location
    "confidence": 0.87, // Optional. ML confidence score (0.0–1.0)
    "snapshotUrl": "https://...", // Optional. URL to snapshot image
    "base64Image": "data:image/png;base64,..." // Optional. Base64 image; stub upload
  }
  ```

### Responses

- **201 Created**

  ```json
  {
    "success": true,
    "event": {
      "_id": "60f8f0f0f0f0f0f0f0f0f0",
      "eventType": "fire",
      "timestamp": "2025-06-26T12:00:00.000Z",
      "priority": 3,
      "cameraId": "cam1",
      "location": "Main Gate",
      "confidence": 0.87,
      "snapshotUrl": "https://via.placeholder.com/300x200.png?text=Snapshot",
      "__v": 0
    }
  }
  ```

- **400 Bad Request**

  ```json
  { "error": "\"eventType\" is required" }
  ```

- **500 Internal Server Error**

  ```json
  { "error": "Internal Server Error" }
  ```

---

## 3. List Events

**Endpoint**: `GET /api/events`

**Purpose**: Retrieve stored events with optional filtering, sorting, and pagination.

### Query Parameters

| Parameter  | Type     | Default       | Description                                      |
| ---------- | -------- | ------------- | ------------------------------------------------ |
| `type`     | `string` | _none_        | Filter by `eventType` ("fire", "fall", "fight")  |
| `priority` | `number` | _none_        | Filter by priority level (1–3)                   |
| `cameraId` | `string` | _none_        | Filter by camera identifier                      |
| `limit`    | `number` | `50`          | Maximum number of events to return               |
| `sort`     | `string` | `"timestamp"` | Field to sort by (`timestamp`, `priority`, etc.) |
| `order`    | `string` | `"desc"`      | Sort order: `"asc"` or `"desc"`                  |

### Example Request

```bash
curl "http://localhost:5000/api/events?type=fire&limit=10&sort=priority&order=asc"
```

### Response

- **200 OK**

  ```json
  {
    "events": [
      {
        "_id": "60f8f0f0f0f0f0f0f0f0f0",
        "eventType": "fire",
        "timestamp": "2025-06-26T12:00:00.000Z",
        "priority": 3,
        "cameraId": "cam1",
        "location": "Main Gate",
        "confidence": 0.87,
        "snapshotUrl": "https://via.placeholder.com/300x200.png?text=Snapshot",
        "__v": 0
      },
      {
        // ... additional events ...
      }
    ]
  }
  ```

---

## 4. Error Handling

All endpoints propagate errors through a centralized middleware.

- Validation errors return **400** with a descriptive message.
- Server errors return **500** with `{ "error": "Internal Server Error" }`.

---

## 5. Notes

- Snapshot upload is currently a stub. Real storage logic (Supabase/S3) will be added later.
- The `base64Image` field is optional — include it only if you want the backend to generate a snapshot URL.
- For any questions or issues, check the console logs or contact the backend maintainer.

```

```
