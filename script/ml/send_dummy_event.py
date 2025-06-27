# send_dummy_event.py
import requests
import argparse
import datetime
import os
from dotenv import load_dotenv

# Load environment variables from a .env in script/ml if present
load_dotenv()

def send_event(eventType, cameraId, location, backend_url, api_key=None):
    payload = {
        "eventType": eventType,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "cameraId": cameraId,
        "location": location,
        # No snapshotUrl for now; can add if you upload placeholder images
    }
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key
    try:
        resp = requests.post(backend_url, json=payload, headers=headers, timeout=5)
        print(f"Sent event: {payload}")
        print("Response:", resp.status_code, resp.text)
    except Exception as e:
        print("Error sending event:", e)

def main():
    parser = argparse.ArgumentParser(description="Send dummy event to WatchtowerX backend")
    parser.add_argument("--type", required=True, choices=["fire", "fall", "fight"], help="Event type")
    parser.add_argument("--camera", default="cam1", help="Camera ID")
    parser.add_argument("--location", default="Unknown", help="Location string")
    parser.add_argument("--backend-url", default=None,
                        help="Backend event endpoint URL, e.g. http://localhost:5000/api/event")
    parser.add_argument("--api-key", default=None, help="API key for backend ingestion, if used")
    args = parser.parse_args()

    # Determine backend_url: from arg or environment
    backend_url = args.backend_url or os.getenv("BACKEND_EVENT_URL")
    if not backend_url:
        print("Error: backend URL not specified. Use --backend-url or set BACKEND_EVENT_URL in .env")
        return

    send_event(args.type, args.camera, args.location, backend_url, args.api_key or os.getenv("API_KEY"))

if __name__ == "__main__":
    main()
