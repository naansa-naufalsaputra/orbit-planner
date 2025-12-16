import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app, auth, googleProvider, db;

try {
    // Validate config presence (basic check)
    if (!firebaseConfig.apiKey) {
        throw new Error("Firebase API Key is missing! Check your .env file or Vercel Environment Variables.");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('https://www.googleapis.com/auth/calendar');
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    // Export mock objects that throw error on usage, so ErrorBoundary catches it
    const throwError = () => { throw new Error(error.message || "Firebase failed to initialize."); };
    auth = {
        currentUser: null,
        signInWithPopup: throwError,
        signOut: throwError,
        onAuthStateChanged: (cb) => { cb(null); return () => { }; }
    };
    db = { collection: throwError };
    googleProvider = {};
}

export { app, auth, googleProvider, db };
