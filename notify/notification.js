// notifications.js

// Firebase CDN imports (for non-module HTML)
const firebaseConfig = {
  apiKey: "AIzaSyC0zXJqObttjV8o14Z2PRALPyX2597zPbA",
  authDomain: "watchtowerx-209b3.firebaseapp.com",
  projectId: "watchtowerx-209b3",
  storageBucket: "watchtowerx-209b3.firebasestorage.app",
  messagingSenderId: "871383253881",
  appId: "1:871383253881:web:a4ee8b96ab4aed4e5965a8",
  measurementId: "G-H43KFRRB9B"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

export async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('✅ Service Worker registered:', registration);
  } catch (err) {
    console.error('❌ Service Worker registration failed:', err);
  }
}

export async function subscribeAndGetToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission not granted.');
      return;
    }

    const token = await messaging.getToken({
      vapidKey: 'BH7ta0E8L_GhDr9NOEx4C7jF_ZLUNHGd02kG5GwRM5fnrubcoiV_rZpbnhA1CCiTkASmPtfhrBaj0PxDh5RsJx8'
    });

    if (token) {
      console.log('✅ Token:', token);
      document.getElementById('token').textContent = token;
      navigator.clipboard.writeText(token);
      alert('✅ Token copied to clipboard!');
    } else {
      console.warn('⚠️ No token received.');
    }
  } catch (err) {
    console.error('❌ Error getting token:', err);
  }
}

export function setupOnMessageHandler() {
  messaging.onMessage((payload) => {
    console.log('📩 Foreground message received:', payload);

    const alertBox = document.createElement('div');
    alertBox.className = 'alert';
    alertBox.innerHTML = `<strong>${payload.notification?.title}</strong><br>${payload.notification?.body}`;
    document.getElementById('alerts').prepend(alertBox);

    new Notification(payload.notification?.title || 'Alert', {
      body: payload.notification?.body || 'You have a new message.',
      icon: 'https://placehold.co/48x48/0369A1/FFFFFF?text=WTX'
    });
  });
}
