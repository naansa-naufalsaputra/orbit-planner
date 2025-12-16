import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Trash2, MapPin, Clock } from "lucide-react";

export default function Schedule() {
    const { currentUser } = useAuth();
    const [classes, setClasses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newClass, setNewClass] = useState({
        day: "Senin",
        subject: "",
        time: "",
        venue: ""
    });
    const [loading, setLoading] = useState(false);

    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, "schedule"),
            where("userId", "==", currentUser.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClasses(data);
        });
        return unsubscribe;
    }, [currentUser]);

    async function handleAddClass(e) {
        e.preventDefault();
        if (!newClass.subject || !newClass.time) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "schedule"), {
                userId: currentUser.uid,
                ...newClass
            });
            setIsAdding(false);
            setNewClass({ day: "Senin", subject: "", time: "", venue: "" });
        } catch (e) {
            console.error(e);
            alert("Gagal menambahkan jadwal");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Hapus jadwal ini?")) return;
        try {
            await deleteDoc(doc(db, "schedule", id));
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jadwal Kuliah</h1>
                    <p className="text-muted-foreground">Kelola jadwal mingguanmu.</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal
                </Button>
            </div>

            {isAdding && (
                <Card className="mb-8 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Tambah Jadwal Baru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddClass} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <select
                                    className="p-3 rounded-md border bg-background"
                                    value={newClass.day}
                                    onChange={e => setNewClass({ ...newClass, day: e.target.value })}
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <input
                                    placeholder="Mata Kuliah (Cth: Kalkulus)"
                                    className="p-3 rounded-md border bg-background"
                                    value={newClass.subject}
                                    onChange={e => setNewClass({ ...newClass, subject: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Waktu (Cth: 08:00 - 10:00)"
                                    className="p-3 rounded-md border bg-background"
                                    value={newClass.time}
                                    onChange={e => setNewClass({ ...newClass, time: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Ruangan (Cth: A101)"
                                    className="p-3 rounded-md border bg-background"
                                    value={newClass.venue}
                                    onChange={e => setNewClass({ ...newClass, venue: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
                                <Button type="submit" disabled={loading}>Simpan</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                {days.map(day => {
                    const dayClasses = classes
                        .filter(c => c.day === day)
                        .sort((a, b) => a.time.localeCompare(b.time));

                    if (dayClasses.length === 0) return null;

                    return (
                        <div key={day}>
                            <h3 className="text-lg font-semibold mb-3 text-primary">{day}</h3>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {dayClasses.map(cls => (
                                    <Card key={cls.id} className="relative group">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg">{cls.subject}</h4>
                                                <button
                                                    onClick={() => handleDelete(cls.id)}
                                                    className="text-muted-foreground hover:text-destructive opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    <span>{cls.time}</span>
                                                </div>
                                                {cls.venue && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} />
                                                        <span>{cls.venue}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {classes.length === 0 && !isAdding && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>Belum ada jadwal. Klik "Tambah Jadwal" untuk memulai!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
