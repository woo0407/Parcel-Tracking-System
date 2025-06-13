// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3sDVTTnt8BIjNOJDCE5-OqRdDkTBo9Y0",
  authDomain: "soldesk-46a18.firebaseapp.com",
  databaseURL: "https://soldesk-46a18-default-rtdb.firebaseio.com",
  projectId: "soldesk-46a18",
  storageBucket: "soldesk-46a18.firebasestorage.app",
  messagingSenderId: "379779552470",
  appId: "1:379779552470:web:5be910f71f59e920852577",
  measurementId: "G-6E4MEL85RL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth };
