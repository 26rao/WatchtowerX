import requests
import json
from datetime import datetime

# 🔧 Configure your backend URL
BACKEND_URL = 'http://localhost:5000/notify'

# 🔐 Replace with valid FCM tokens
TOKENS = [
    "fRIYJo1CuSUY39eEdXxv8h:APA91bGckrUQDQB8trZ2Jfn6T2_XYsxy1K_csoXRAZKYntUsDOv5tTlX0F_0FZb3PfRWhoJrmPf4IIrJWtSg48cG37f-nk3pRfBqB_eaRypa6bAwMuW3ZPA"
]

# 🧠 Simulated AI trigger
payload = {
    "tokens": TOKENS,
    "type": "fall",  # fire / fall / fight / weapon
    "confidence": 0.91,
    "reason": "Sudden collapse detected in corridor",
    "timestamp": datetime.utcnow().isoformat()
}

# 📡 Send POST request to backend
try:
    res = requests.post(BACKEND_URL, data=json.dumps(payload), headers={'Content-Type': 'application/json'})
    print(f"✅ Response: {res.status_code}")
    print(res.json())
except Exception as e:
    print("❌ Error:", e)
