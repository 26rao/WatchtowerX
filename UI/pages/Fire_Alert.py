import streamlit as st
from datetime import datetime

st.set_page_config(page_title="🔥 Fire Alert Details", layout="wide", page_icon="🔥")

# Parse eventId from query params (for demo, but not used)
query_params = st.experimental_get_query_params()
event_id = query_params.get("eventId", [None])[0]

# Simulate user role (for demo)
user_role = st.sidebar.selectbox("User Role", ["Operator", "Admin", "Viewer"], index=0)
st.sidebar.info(f"Current Role: {user_role}")

# --- Always use dummy alert data ---
evt = {
    "eventId": "evt_10023",
    "eventType": "fire",
    "timestamp": "2025-06-25T22:30:00Z",
    "location": "Warehouse Sector 3",
    "severity": "high",
    "snapshotUrl": "https://via.placeholder.com/400x250/ffdddd/990000?text=Fire+Detected+Frame",
    "status": "dispatched",
    "notes": "Detected by Camera 3",
    "timeline": [
        {"time": "2025-06-25T22:30:00Z", "event": "Alert created"},
        {"time": "2025-06-25T22:31:00Z", "event": "Smoke detected by Camera 3"},
        {"time": "2025-06-25T22:32:00Z", "event": "System classified event as FIRE"},
        {"time": "2025-06-25T22:33:00Z", "event": "Alert dispatched to Emergency Team"},
        {"time": "2025-06-25T22:34:00Z", "event": "Surveillance confirmed flames"},
        {"time": "2025-06-25T22:35:00Z", "event": "Response team ETA: 3 minutes"}
    ],
    "media": [
        "https://via.placeholder.com/400x250/ffdddd/990000?text=Fire+Detected+Frame",
        "https://via.placeholder.com/400x250/ffaaaa/660000?text=Flames+Confirmed"
    ]
}

st.title(f"🔥 Fire Alert - {evt.get('location', 'Unknown')}")
st.caption("Alert Triggered: " + evt.get("timestamp", "")[:19].replace("T", " "))

# --- 1. Timeline ---
st.subheader("🕒 Incident Timeline")
timeline = evt.get("timeline") or []
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
folium.Marker(incident_location, tooltip="Active Incident", icon=folium.Icon(color="red")).add_to(map_)
st_folium(map_, width=700, height=300)

# --- 5. Operator Notes ---
st.subheader("📝 Operator Notes")
notes = st.text_area("Add/View Notes", evt.get("notes", ""), height=100)
if st.button("Save Note"):
    st.success("Note saved (demo only)")

# --- 6. Automated Response Suggestion ---
st.subheader("🤖 Suggested Response")
suggestion = "Dispatch fire response team and notify local authorities. Monitor live feed for escalation."
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