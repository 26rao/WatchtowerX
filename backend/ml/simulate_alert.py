#!/usr/bin/env python3
import requests
import argparse
from datetime import datetime

def main():
    parser = argparse.ArgumentParser(
        description="Simulate an AI alert to WatchtowerX backend"
    )

    parser.add_argument(
        "--type",
        required=True,
        choices=["fire", "fall", "fight", "weapon"],
        help="Type of alert to simulate",
    )
    parser.add_argument(
        "--tokens",
        nargs="+",
        default=["your-fcm-token-here"],
        help="One or more FCM tokens to receive the simulated alert",
    )
    parser.add_argument(
        "--backend",
        default="http://localhost:5000",
        help="Base URL of the WatchtowerX backend (default http://localhost:5000)",
    )
    args = parser.parse_args()

    payload = {
        "tokens": args.tokens,
        "type": args.type,
        "confidence": 0.9,
        "reason": f"Simulated {args.type} event",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    url = f"{args.backend}/notify"
    print(f"→ Posting to {url}\n  Payload: {payload}\n")

    try:
        resp = requests.post(url, json=payload, timeout=5)
        print(f"✅ Response: {resp.status_code}")
        print(resp.json())
    except Exception as e:
        print("❌ Error:", e)

if __name__ == "__main__":
    main()
