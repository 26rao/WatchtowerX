# Backend API


## POST /api/event
- Description: Receive a new event from ML module.
- URL: `/api/event`
- Method: POST
- Headers: `Content-Type: application/json`
- Body JSON:
  - `eventType` (string, required): `"fire"`, `"fall"`, or `"fight"`.
  - `timestamp` (string, optional): ISO format; if omitted, server time used.
  - `cameraId` (string, optional).
  - `location` (string, optional).
  - `snapshotUrl` (string, optional).
- Success response `201 Created`:
  ```json
  {
    "success": true,
    "event": {
      "_id": "...",
      "eventType": "fire",
      "timestamp": "...",
      "cameraId": "cam1",
      "location": null,
      "snapshotUrl": null,
      "priority": 3,
      "__v": 0
    }
  }


Error 400 Bad Request if missing/invalid eventType.

Error 500 Internal Server Error on server error.

GET /api/events
Description: Retrieve recent events.

URL: /api/events

Method: GET

Query params (optional):

limit (number, default 10).

sortBy: "timestamp" (default) or "priority".

sortOrder: "asc" or "desc" (default "desc").

Example: /api/events?limit=5&sortBy=priority&sortOrder=desc

Success response 200 OK:


{
  "events": [
    {
      "_id": "...",
      "eventType": "fire",
      "timestamp": "...",
      "cameraId": "cam1",
      "location": null,
      "snapshotUrl": null,
      "priority": 3,
      "__v": 0
    },
    ...
  ]
}

