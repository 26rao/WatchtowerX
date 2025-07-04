import streamlit as st
from streamlit_folium import st_folium
import folium
import time
import random
import requests
from datetime import datetime

st.set_page_config(
    page_title="WatchTowerX | Dashboard",
    layout="wide",
    page_icon="🛡️"
)

st.markdown("""
    <style>
    html, body, [class*="css"]  {
        font-family: 'Segoe UI', sans-serif;
        background-color: #f9fbfd;
    }
    .main-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #2c3e50;
        margin-bottom: 0.5rem;
    }
    .metric-card {
        background: linear-gradient(145deg, #ffffff, #e4e8ec);
        border-radius: 12px;
        padding: 1.2rem;
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }
    .card-title {
        color: #3498db;
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }
    .alert-card {
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 0.5rem;
        color: white;
        font-weight: 600;
        cursor: pointer;
    }
    .fire { background-color: #e74c3c; }
    .theft { background-color: #9b59b6; }
    .accident { background-color: #f39c12; }
    .video-placeholder {
        border-radius: 12px;
        border: 2px dashed #bdc3c7;
        background: #ecf0f1;
        padding: 1rem;
        text-align: center;
        font-weight: bold;
    }
    </style>
""", unsafe_allow_html=True)

st.markdown("<h1 class='main-title'>🛡️ WatchTowerX AI Surveillance Dashboard</h1>", unsafe_allow_html=True)
st.caption("Last synced: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

metric_col1, metric_col2, metric_col3 = st.columns(3)
with metric_col1:
    st.markdown("<div class='metric-card'><div class='card-title'>Active Cameras</div>", unsafe_allow_html=True)
    st.metric("", "12 Online")
    st.markdown("</div>", unsafe_allow_html=True)
with metric_col2:
    st.markdown("<div class='metric-card'><div class='card-title'>Incidents Detected</div>", unsafe_allow_html=True)
    st.metric("", f"{random.randint(15, 30)} Today")
    st.markdown("</div>", unsafe_allow_html=True)
with metric_col3:
    st.markdown("<div class='metric-card'><div class='card-title'>Response Time Avg</div>", unsafe_allow_html=True)
    st.metric("", f"{round(random.uniform(4.5, 9.0), 1)} min")
    st.markdown("</div>", unsafe_allow_html=True)

col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("🔴 Live Video Feed")
    st.markdown("<div class='video-placeholder'>[LIVE STREAM PLACEHOLDER]</div>", unsafe_allow_html=True)
    st.image("https://via.placeholder.com/640x360.png?text=Camera+Stream", use_column_width=True)

with col2:
    st.subheader("🚨 Critical Alerts (Live API Feed)")
    # Allow filtering by event type
    event_type = st.selectbox("Filter by type", ["all", "fire", "theft", "accident"], index=0)
    # --- DUMMY DATA FOR TESTING ---
    all_events = [
        {
            "eventId": "evt_10023",
            "eventType": "fire",
            "timestamp": "2025-06-25T22:30:00Z",
            "location": "Warehouse Sector 3",
            "severity": "high",
            "snapshotUrl": "https://via.placeholder.com/400x250/ffdddd/990000?text=Fire+Detected+Frame",
            "status": "dispatched",
            "notes": "Detected by Camera 3"
        },
        {
            "eventId": "evt_10024",
            "eventType": "theft",
            "timestamp": "2025-06-25T21:10:00Z",
            "location": "Main Entrance Gate 3",
            "severity": "medium",
            "snapshotUrl": "https://via.placeholder.com/400x250/ded3f9/5e3b8c?text=Motion+Trigger",
            "status": "pending",
            "notes": "Suspect seen carrying unknown object"
        },
        {
            "eventId": "evt_10025",
            "eventType": "accident",
            "timestamp": "2025-06-25T20:05:00Z",
            "location": "Zone B, Vehicle Docking Area",
            "severity": "moderate",
            "snapshotUrl": None,
            "status": "resolved",
            "notes": "Security staff tripped over loose cargo strap"
        }
    ]
    # --- END DUMMY DATA ---

    # Filter events by type if not 'all'
    if event_type == "all":
        events = all_events
    else:
        events = [e for e in all_events if e["eventType"] == event_type]

    for evt in events:
        color_class = {
            "fire": "fire",
            "theft": "theft",
            "accident": "accident"
        }.get(evt.get("eventType", "fire"), "fire")

        page_map = {
            "fire": "Fire_Alert",
            "theft": "Theft_Alert",
            "accident": "Accident_Alert"
        }

        url = evt.get("snapshotUrl") or "https://via.placeholder.com/400x250?text=No+Snapshot+Available"
        label = f"{evt.get('eventType', '').upper()} | {evt.get('location', 'Unknown')} | {evt.get('timestamp', '')[:19].replace('T', ' ')}"
        severity = evt.get('severity', '').capitalize()
        status = evt.get('status', '').capitalize()
        notes = evt.get('notes', '')
        page = page_map.get(evt.get("eventType", "fire"), "Fire_Alert")
        event_id = evt.get("eventId", "")
        alert_url = f"/pages/{page}?eventId={event_id}"

        st.markdown(f"""
        <a href='{alert_url}' style='text-decoration:none;'>
            <div class='alert-card {color_class}'>
                <div><b>{label}</b></div>
                <div>Severity: {severity} | Status: {status}</div>
                <div style='font-size:0.9em; color:#f5f6fa;'>{notes}</div>
                <img src='{url}' style='width:100%; max-width:320px; border-radius:8px; margin-top:0.5em;'/>
            </div>
        </a>
        """, unsafe_allow_html=True)

st.subheader("🗺️ Smart Dispatch Map")
incident_location = (-1.2921, 36.8219)
map_ = folium.Map(location=incident_location, zoom_start=14)
folium.Marker(incident_location, tooltip="Active Incident", icon=folium.Icon(color="red")).add_to(map_)
st_folium(map_, width=1400, height=400)

st.markdown("---")
st.caption("© 2025 WatchTowerX AI Response System")