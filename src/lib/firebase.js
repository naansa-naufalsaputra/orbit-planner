import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCfd2J3L7qd7Y5bMPoSbis3r0Jv0M9djhY",
    authDomain: "student-planner-38276.firebaseapp.com",
    projectId: "student-planner-38276",
    storageBucket: "student-planner-38276.firebasestorage.app",
    messagingSenderId: "448392516680",
    appId: "1:448392516680:web:b62756e1fdb5246476b47d",
    measurementId: "G-5N6QSB7LZV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
export const db = getFirestore(app);
