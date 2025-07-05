// frontend/src/firebase-messaging.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ✅ Firebase config from Neha (replace with your own if needed)
const firebaseConfig = {
  apiKey: "AIzaSyC0zXJqObttjV8o14Z2PRALPyX2597zPbA",
  authDomain: "watchtowerx-209b3.firebaseapp.com",
  projectId: "watchtowerx-209b3",
  storageBucket: "watchtowerx-209b3.firebasestorage.app",
  messagingSenderId: "871383253881",
  appId: "1:871383253881:web:a4ee8b96ab4aed4e5965a8",
  measurementId: "G-H43KFRRB9B"
};

// ✅ Your VAPID key (provided by Neha)
const VAPID_KEY = "BH7ta0E8L_GhDr9NOEx4C7jF_ZLUNHGd02kG5GwRM5fnrubcoiV_rZpbnhA1CCiTkASmPtfhrBaj0PxDh5RsJx8";

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Get and log token (You can store or send this to backend)
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      console.log('✅ FCM Token:', currentToken);
      // TODO: send token to backend or store it
    } else {
      console.warn('⚠️ No registration token available. Ask for permission.');
    }
  } catch (err) {
    console.error('❌ An error occurred while retrieving token.', err);
  }
};

// Listen to messages when app is in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📥 Foreground message:', payload);
      resolve(payload);
    });
  });
