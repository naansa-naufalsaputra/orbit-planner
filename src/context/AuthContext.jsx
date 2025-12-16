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
    getRedirectResult,
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
        // Safety timeout: If Firebase takes too long (>10s), force stop loading
        const safetyTimer = setTimeout(() => {
            if (loading) {
                console.warn("Auth check timed out. Defaulting to null user.");
                setLoading(false);
            }
        }, 10000);

        // Handle Redirect Result (for Mobile/WebView)
        getRedirectResult(auth).catch(err => {
            console.error("Redirect Login Error:", err);
            // We could set a global error state here if needed
        });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            clearTimeout(safetyTimer);
        });

        return () => {
            unsubscribe();
            clearTimeout(safetyTimer);
        };
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
