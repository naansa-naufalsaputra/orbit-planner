import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext"; // Import Gamification
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { User, BookOpen, Brain, Save, Sparkles, GraduationCap, Trophy, Medal } from "lucide-react"; // Added Icons

import { cn } from "../lib/utils";

export default function Profile() {
    const { currentUser } = useAuth();
    const { xp, level, badges } = useGamification(); // Use Gamification
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        displayName: currentUser?.displayName || "",
        major: "",
        currentFocus: "",
        learningStyle: "Casual", // Casual, Formal, Creative, Academic
        bio: ""
    });

    useEffect(() => {
        if (!currentUser) return;

        async function fetchProfile() {
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile({ ...profile, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        }

        fetchProfile();
    }, [currentUser]);

    async function handleSave(e) {
        e.preventDefault();
        setLoading(true);

        try {
            await setDoc(doc(db, "users", currentUser.uid), {
                ...profile,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // Show simple feedback
            alert("Profil berhasil disimpan! AI sekarang akan menyesuaikan dengan gayamu. ✨");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Gagal menyimpan profil.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                    <User className="h-8 w-8 text-blue-600" />
                    Profil Pengguna
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Ceritakan sedikit tentang dirimu agar Orbit AI bisa membantumu lebih baik.
                </p>
            </div>

            <form onSubmit={handleSave}>
                <div className="grid gap-6">
                    {/* Gamification Stats */}
                    <Card className="border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-24 bg-yellow-400/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                                Level Pengguna
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-20 w-20 rounded-full bg-yellow-200 dark:bg-yellow-900 flex items-center justify-center border-4 border-yellow-400 shadow-inner">
                                    <span className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{level}</span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>XP: {xp}</span>
                                        <span>Next Level: {(Math.floor(xp / 100) + 1) * 100} XP</span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="h-4 w-full bg-yellow-200/50 rounded-full overflow-hidden border border-yellow-200">
                                        <div
                                            className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000 ease-out"
                                            style={{ width: `${(xp % 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Kumpulkan XP dengan menyelesaikan tugas dan sesi fokus!
                                    </p>
                                </div>
                            </div>

                            {/* Badges Area */}
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                    <Medal className="h-4 w-4 text-orange-500" /> Badges
                                </h4>
                                <div className="flex gap-2 flex-wrap">
                                    {badges.length > 0 ? badges.map((badge, i) => (
                                        <div key={i} className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full border border-yellow-200 text-xs font-medium flex items-center gap-1 shadow-sm">
                                            🏅 {badge}
                                        </div>
                                    )) : (
                                        <span className="text-xs text-muted-foreground italic">Belum ada badge. Terus semangat!</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-purple-500" />
                                Identitas Akademik
                            </CardTitle>
                            <CardDescription>
                                Jurusan dan topik yang sedang kamu pelajari.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Nama Panggilan</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={profile.displayName}
                                    onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                                    placeholder="Nama kamu..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Jurusan / Program Studi</label>
                                <input
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={profile.major}
                                    onChange={e => setProfile({ ...profile, major: e.target.value })}
                                    placeholder="Contoh: Teknik Informatika, Sastra Inggris..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Fokus Belajar Saat Ini</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={profile.currentFocus}
                                    onChange={e => setProfile({ ...profile, currentFocus: e.target.value })}
                                    placeholder="Apa yang sedang kamu dalami? (Misal: Skripsi tentang AI, Persiapan UAS Akuntansi...)"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Preference */}
                    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Brain className="h-5 w-5 text-blue-500" />
                                Preferensi AI
                            </CardTitle>
                            <CardDescription>
                                Atur bagaimana Orbit AI (Gemini) berinteraksi denganmu.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Gaya Bahasa AI</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['Casual', 'Formal', 'Creative', 'Academic'].map((style) => (
                                        <div
                                            key={style}
                                            onClick={() => setProfile({ ...profile, learningStyle: style })}
                                            className={cn(
                                                "cursor-pointer rounded-lg border p-4 text-center text-sm font-medium transition-all hover:border-primary",
                                                profile.learningStyle === style
                                                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                                                    : "bg-background text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {style}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    *Casual (Santai), Formal (Resmi), Creative (Puitis/Unik), Academic (Ilmiah/Detail)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg" className="w-full md:w-auto md:self-end" disabled={loading}>
                        {loading ? <Sparkles className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Profil
                    </Button>
                </div>
            </form>
        </div>
    );
}
