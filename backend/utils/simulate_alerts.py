import requests
import json

# 🔁 Change this to your actual running backend URL
URL = "http://localhost:5000/notify"

payload = {
    "title": "🔥 Fire Alert!",
    "body": "Fire detected in Sector 7",
    "priority": "high"
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(URL, headers=headers, data=json.dumps(payload))

print("Status Code:", response.status_code)
print("Response:", response.json())
