import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { generateMotivation } from "../lib/gemini";
import { Plus, BookOpen, Clock, CheckCircle, Calendar as CalendarIcon, StickyNote, Sun, Moon, Sunrise, Sunset, Sparkles, RefreshCw, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import FocusTimer from "../components/FocusTimer";

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [greeting, setGreeting] = useState({ title: "", quote: "", icon: Sun });
    const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
    const [todayClasses, setTodayClasses] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        let timeOfDay = "morning";
        let title = "Selamat Pagi";
        let icon = Sunrise;

        if (hour >= 5 && hour < 12) {
            timeOfDay = "morning";
            title = "Selamat Pagi";
            icon = Sunrise;
        } else if (hour >= 12 && hour < 17) {
            timeOfDay = "afternoon";
            title = "Selamat Siang";
            icon = Sun;
        } else if (hour >= 17 && hour < 21) {
            timeOfDay = "evening";
            title = "Selamat Sore";
            icon = Sunset;
        } else {
            timeOfDay = "night";
            title = "Selamat Malam";
            icon = Moon;
        }

        setGreeting({
            title,
            quote: "Memuat inspirasi...",
            icon
        });

        // Load random quote initially
        import("../lib/quotes").then(({ getRandomQuote }) => {
            setGreeting(prev => ({
                ...prev,
                quote: getRandomQuote(timeOfDay)
            }));
        });
    }, []);

    // Fetch Today's Schedule
    useEffect(() => {
        if (!currentUser) return;

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const todayName = days[new Date().getDay()];

        const q = query(
            collection(db, "schedule"),
            where("userId", "==", currentUser.uid),
            where("day", "==", todayName)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by start time
            classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setTodayClasses(classes);
            setLoadingSchedule(false);
        });

        return unsubscribe;
    }, [currentUser]);

    async function handleGenerateQuote() {
        setIsGeneratingQuote(true);
        const hour = new Date().getHours();
        let timeOfDay = "morning";
        if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
        else if (hour >= 17 && hour < 21) timeOfDay = "evening";
        else if (hour < 5 || hour >= 21) timeOfDay = "night";

        try {
            const newQuote = await generateMotivation(timeOfDay, currentUser?.displayName || "Mahasiswa");
            setGreeting(prev => ({ ...prev, quote: newQuote }));
        } catch (error) {
            console.error("Failed to generate quote", error);
        } finally {
            setIsGeneratingQuote(false);
        }
    }

    const Icon = greeting.icon;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-6 w-6 text-orange-500 dark:text-yellow-400" />
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {greeting.title}, {currentUser?.displayName?.split(" ")[0] || "Mahasiswa"}!
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-muted-foreground italic">
                            "{greeting.quote}"
                        </p>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleGenerateQuote}
                            disabled={isGeneratingQuote}
                            className="h-6 w-6 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600"
                            title="Generate AI Quote"
                        >
                            <RefreshCw className={cn("h-3 w-3", isGeneratingQuote && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Universal Add Button */}
                <div className="relative">
                    <Button
                        onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                        className={cn("rounded-full w-12 h-12 p-0 shadow-lg transition-transform hover:rotate-90", isAddMenuOpen && "rotate-45")}
                    >
                        <Plus className="h-6 w-6" />
                    </Button>

                    {isAddMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-card border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-1 flex flex-col gap-1">
                                <Link to="/notes" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                                    <StickyNote className="h-4 w-4 text-blue-500" /> Catatan Baru
                                </Link>
                                <Link to="/tasks" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                                    <Clock className="h-4 w-4 text-green-500" /> Tugas Baru
                                </Link>
                                <Link to="/schedule" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors">
                                    <CalendarIcon className="h-4 w-4 text-purple-500" /> Jadwal Baru
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* 1. Focus Timer Widget */}
                <div className="lg:col-span-1">
                    <FocusTimer />
                </div>

                {/* 2. Today's Schedule Widget */}
                <Card className="lg:col-span-2 h-full border-purple-200 dark:border-purple-900 overflow-hidden flex flex-col relative group backdrop-blur-sm bg-card/90">
                    <div className="absolute top-0 right-0 p-20 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-opacity duration-1000 group-hover:opacity-100 opacity-50" />

                    <CardHeader className="bg-purple-50/50 dark:bg-purple-900/10 pb-4 z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl">Jadwal Hari Ini</CardTitle>
                                <CardDescription>
                                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild className="hidden md:flex">
                                <Link to="/schedule">Lihat Semua</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto max-h-[300px] z-10 relative">
                        {loadingSchedule ? (
                            <div className="p-8 text-center text-muted-foreground animate-pulse">Memuat jadwal...</div>
                        ) : todayClasses.length > 0 ? (
                            <div className="divide-y relative">
                                {todayClasses.map((cls, index) => {
                                    // Parse time string e.g. "09:00 - 10:30" or "09.00-10.30"
                                    const timeParts = cls.time ? cls.time.split(/[-–]/).map(t => t.trim()) : ["??", "??"];
                                    const startTime = timeParts[0] || "";
                                    const endTime = timeParts[1] || "";

                                    return (
                                        <div key={cls.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col items-center bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg p-2 min-w-[80px]">
                                                <span className="font-bold text-sm">{startTime}</span>
                                                <span className="text-xs opacity-70">-</span>
                                                <span className="font-bold text-sm">{endTime}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg leading-none mb-1">{cls.subject}</h3>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {cls.venue || "Online"}</span>
                                                </div>
                                            </div>
                                            {index === 0 && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full animate-pulse">
                                                    Next
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-4 animate-bounce duration-3000">
                                    <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">Hari ini Kosong!</h3>
                                <p>Tidak ada jadwal kuliah hari ini. Waktunya istirahat atau belajar mandiri.</p>
                                <Button variant="link" asChild className="mt-2 text-blue-500">
                                    <Link to="/schedule">Tambah Jadwal?</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Stats / Quick Links Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/tasks">
                    <Card className="hover:scale-[1.05] transition-all duration-300 cursor-pointer h-full border-l-4 border-l-blue-500 hover:shadow-lg hover:shadow-blue-500/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tugas</CardTitle>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Track</div>
                            <p className="text-xs text-muted-foreground">Kelola deadline</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/notes">
                    <Card className="hover:scale-[1.05] transition-all duration-300 cursor-pointer h-full border-l-4 border-l-orange-500 hover:shadow-lg hover:shadow-orange-500/10 delay-75">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Catatan</CardTitle>
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                                <BookOpen className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Ideas</div>
                            <p className="text-xs text-muted-foreground">Simpan materi</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/schedule">
                    <Card className="hover:scale-[1.05] transition-all duration-300 cursor-pointer h-full border-l-4 border-l-purple-500 hover:shadow-lg hover:shadow-purple-500/10 delay-150">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jadwal</CardTitle>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <CalendarIcon className="h-4 w-4 text-purple-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Plan</div>
                            <p className="text-xs text-muted-foreground">Agenda kuliah</p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="hover:scale-[1.05] transition-all duration-300 h-full delay-200 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white border-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-white/10 rounded-full blur-2xl -mr-4 -mt-4 transition-transform duration-700 group-hover:scale-150" />
                    <div className="absolute bottom-0 left-0 p-6 bg-black/10 rounded-full blur-xl -ml-2 -mb-2" />

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-white/90">Status</CardTitle>
                        <div className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
                            <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-2xl font-bold">Active</div>
                        <p className="text-xs text-white/80">Siap produktif!</p>
                    </CardContent>
                </Card>
            </div>

            {/* Decoration Blobs */}
            <div className="fixed top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[5000ms]" />
            <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[7000ms]" />
        </div>
    );
}
