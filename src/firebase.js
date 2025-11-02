import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // optional

const firebaseConfig = {
    apiKey: "AIzaSyBF1XXGPz7BwCIgOfSdDZ-EwLJBBNnGdDs",
    authDomain: "autobank-e9b84.firebaseapp.com",
    projectId: "autobank-e9b84",
    storageBucket: "autobank-e9b84.appspot.com",
    messagingSenderId: "201037656743",
    appId: "1:201037656743:web:d92426cb2f2e4fbe34a182",
    measurementId: "G-0MHMMB8372"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Optional: Analytics
export const analytics = getAnalytics(app);

export default app;
