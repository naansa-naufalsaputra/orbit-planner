import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, Orbit, User, Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Login() {
    const { login, loginEmail, signupEmail, loginGuest } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("login"); // 'login' or 'register'
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleGoogleLogin() {
        try {
            setError("");
            setLoading(true);
            await login();
            navigate("/");
        } catch (e) {
            setError("Failed to sign in via Google.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleEmailAuth(e) {
        e.preventDefault();
        if (!email || !password) return;
        try {
            setError("");
            setLoading(true);
            if (mode === "login") {
                await loginEmail(email, password);
            } else {
                await signupEmail(email, password);
            }
            navigate("/");
        } catch (e) {
            console.error(e);
            setError(e.message.replace("Firebase: ", ""));
        } finally {
            setLoading(false);
        }
    }

    async function handleGuestLogin() {
        try {
            setError("");
            setLoading(true);
            await loginGuest();
            navigate("/");
        } catch (e) {
            setError("Failed to sign in as guest.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                        <Orbit size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Orbit</h1>
                    <p className="text-muted-foreground">{mode === "login" ? "Sign in to your account" : "Create a new account"}</p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full pl-10 p-2 rounded-md border bg-background"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full pl-10 p-2 rounded-md border bg-background"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Processing..." : (mode === "login" ? "Sign In" : "Sign Up")}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google
                    </Button>

                    <Button variant="ghost" type="button" onClick={handleGuestLogin} disabled={loading} className="w-full flex items-center justify-center gap-2">
                        <User size={18} />
                        Continue as Guest
                    </Button>
                </div>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary hover:underline font-medium">
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
