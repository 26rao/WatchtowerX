import { useEffect } from 'react';
import { requestForToken, onMessageListener } from './firebase-messaging';

function App() {
  useEffect(() => {
    // 🔑 Request FCM token on load
    requestForToken();

    // 🔔 Listen for foreground push messages
    onMessageListener()
      .then((payload) => {
        console.log('🔔 Notification received:', payload);
        // Optional: Add UI feedback here (toast, alert, etc.)
      })
      .catch((err) => console.error('Message listener error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-center p-8">
      <h1 className="text-4xl font-bold text-blue-600 underline">Tailwind is working!</h1>
      <p className="mt-4 text-gray-700">Notifications setup is ready 🚀</p>
    </div>
  );
}

export default App;
