import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, isInitialized } from "../lib/firebase";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    GoogleAuthProvider
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function checkInit() {
        if (!isInitialized) throw new Error("Firebase failed to initialize. Missing API Keys.");
    }

    function login() {
        checkInit();
        // Switch to Redirect for better mobile compatibility
        return signInWithRedirect(auth, googleProvider);
    }

    function signupEmail(email, password) {
        checkInit();
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function loginEmail(email, password) {
        checkInit();
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginGuest() {
        checkInit();
        return signInAnonymously(auth);
    }

    function logout() {
        checkInit();
        localStorage.removeItem("googleAccessToken");
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        signupEmail,
        loginEmail,
        loginGuest,
        logout,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <h2>Menghubungkan ke Orbit...</h2>
                <p className="text-xs text-gray-400 mt-2">Checking Authentication...</p>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
