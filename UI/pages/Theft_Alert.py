import streamlit as st
from datetime import datetime
import requests

st.set_page_config(page_title="🕵️ Theft Alert Details", layout="wide", page_icon="🕵️")

# Simulate user role (for demo)
user_role = st.sidebar.selectbox("User Role", ["Operator", "Admin", "Viewer"], index=0)
st.sidebar.info(f"Current Role: {user_role}")

# Parse eventId from query params
query_params = st.experimental_get_query_params()
event_id = query_params.get("eventId", [None])[0]

if event_id:
    try:
        resp = requests.get(f"http://localhost:8000/api/events/{event_id}")
        if resp.status_code == 200:
            evt = resp.json()
        else:
            st.warning(f"No alert found for this eventId. (Status {resp.status_code}) Showing placeholder data.")
            evt = {
                "eventId": "evt_10024",
                "eventType": "theft",
                "timestamp": "2025-06-25T21:10:00Z",
                "location": "Main Entrance Gate 3",
                "severity": "medium",
                "snapshotUrl": "https://via.placeholder.com/400x250/ded3f9/5e3b8c?text=Motion+Trigger",
                "status": "pending",
                "notes": "Suspect seen carrying unknown object",
                "timeline": [
                    {"time": "2025-06-25T21:10:00Z", "event": "Alert created"},
                    {"time": "2025-06-25T21:11:00Z", "event": "Motion detected in restricted zone"},
                    {"time": "2025-06-25T21:12:00Z", "event": "AI confirmed unauthorized entry"},
                    {"time": "2025-06-25T21:13:00Z", "event": "Suspect seen carrying unknown object"},
                    {"time": "2025-06-25T21:14:00Z", "event": "System dispatched alert"},
                    {"time": "2025-06-25T21:15:00Z", "event": "Nearest patrol notified"}
                ],
                "media": [
                    "https://via.placeholder.com/400x250/ded3f9/5e3b8c?text=Motion+Trigger",
                    "https://via.placeholder.com/400x250/c3b1e1/452773?text=Suspect+Identified"
                ]
            }
    except Exception as e:
        st.warning(f"Failed to load alert details: {e}. Showing placeholder data.")
        evt = {
            "location": "Unknown",
            "timestamp": datetime.now().isoformat(),
            "severity": "unknown",
            "status": "unknown",
            "notes": "No data available for this alert.",
            "snapshotUrl": None,
            "timeline": [
                {"time": datetime.now().isoformat(), "event": "Alert created"}
            ],
            "media": [
                "https://via.placeholder.com/400x250/ded3f9/5e3b8c?text=Motion+Trigger"
            ]
        }
else:
    st.error("No eventId provided.")
    st.stop()

st.title(f"🕵️ Theft Alert - {evt.get('location', 'Unknown')}")
st.caption("Alert Triggered: " + evt.get("timestamp", "")[:19].replace("T", " "))

# --- 1. Timeline ---
st.subheader("🕒 Incident Timeline")
timeline = evt.get("timeline") or [
    {"time": evt.get("timestamp", ""), "event": "Alert created"},
    {"time": "2025-06-25T21:11:00Z", "event": "Motion detected in restricted zone"},
    {"time": "2025-06-25T21:12:00Z", "event": "AI confirmed unauthorized entry"},
    {"time": "2025-06-25T21:13:00Z", "event": "Suspect seen carrying unknown object"},
    {"time": "2025-06-25T21:14:00Z", "event": "System dispatched alert"},
    {"time": "2025-06-25T21:15:00Z", "event": "Nearest patrol notified"}
]
for t in timeline:
    st.markdown(f"- **{t['time'][11:19]}** - {t['event']}")

# --- 2. Acknowledge/Resolve/Escalate ---
st.subheader("🛠️ Operator Actions")
if user_role in ["Operator", "Admin"]:
    colA, colB, colC = st.columns(3)
    with colA:
        if st.button("Acknowledge Alert"):
            st.success("Alert acknowledged!")
    with colB:
        if st.button("Mark as Resolved"):
            st.success("Alert marked as resolved!")
    with colC:
        if st.button("Escalate Alert"):
            st.warning("Alert escalated!")
else:
    st.info("Operator actions available to Operator/Admin only.")

# --- 3. Live Camera Feed (Simulated) ---
st.subheader("🔴 Live Camera Feed")
st.video("https://www.w3schools.com/html/mov_bbb.mp4")

# --- 4. Map with Incident Location ---
st.subheader("🗺️ Incident Location Map")
import folium
from streamlit_folium import st_folium
incident_location = (-1.2921, 36.8219)
map_ = folium.Map(location=incident_location, zoom_start=14)
folium.Marker(incident_location, tooltip="Active Incident", icon=folium.Icon(color="purple")).add_to(map_)
st_folium(map_, width=700, height=300)

# --- 5. Operator Notes ---
st.subheader("📝 Operator Notes")
notes = st.text_area("Add/View Notes", evt.get("notes", ""), height=100)
if st.button("Save Note"):
    st.success("Note saved (demo only)")

# --- 6. Automated Response Suggestion ---
st.subheader("🤖 Suggested Response")
suggestion = "Notify law enforcement and review camera logs. Monitor for further unauthorized activity."
st.info(suggestion)

# --- 7. Analytics (Demo) ---
import plotly.express as px
st.subheader("📊 Incident Analytics")
st.plotly_chart(px.bar(x=["Fire", "Theft", "Accident"], y=[12, 7, 5], labels={'x':'Type','y':'Count'}, title="Incidents by Type"))
st.plotly_chart(px.line(x=["10:00","11:00","12:00","13:00"], y=[2,4,6,3], labels={'x':'Hour','y':'Incidents'}, title="Incidents Over Time"))

# --- 9. User Management UI (Demo) ---
st.sidebar.markdown("---")
st.sidebar.header("User Management (Demo)")
st.sidebar.write("- Admin: Full access\n- Operator: Can acknowledge/resolve\n- Viewer: Read-only")

# --- 10. Media Gallery ---
st.subheader("🖼️ Media Gallery")
media = evt.get("media") or [evt.get("snapshotUrl")]
if media:
    for img in media:
        st.image(img or "https://via.placeholder.com/400x250?text=No+Snapshot+Available", width=350)
else:
    st.info("No media available.")

st.markdown("---")
st.caption("WatchTowerX | Incident Response Logbook")