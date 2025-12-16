import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Trash2, GraduationCap, Calculator, Award } from "lucide-react";

export default function Grades() {
    const { currentUser } = useAuth();
    const [grades, setGrades] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newGrade, setNewGrade] = useState({
        semester: "1",
        subject: "",
        sks: "3",
        grade: "A"
    });
    const [loading, setLoading] = useState(false);

    const gradePoints = {
        "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "D": 1.0, "E": 0.0
    };

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, "grades"),
            where("userId", "==", currentUser.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by semester then subject
            data.sort((a, b) => a.semester - b.semester || a.subject.localeCompare(b.subject));
            setGrades(data);
        });
        return unsubscribe;
    }, [currentUser]);

    async function handleAddGrade(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "grades"), {
                userId: currentUser.uid,
                semester: parseInt(newGrade.semester),
                subject: newGrade.subject,
                sks: parseInt(newGrade.sks),
                grade: newGrade.grade,
                point: gradePoints[newGrade.grade] || 0
            });
            setIsAdding(false);
            setNewGrade({ ...newGrade, subject: "" });
        } catch (e) {
            console.error(e);
            alert("Gagal menyimpan nilai");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (confirm("Hapus nilai ini?")) {
            await deleteDoc(doc(db, "grades", id));
        }
    }

    // Calculate GPA (IPK)
    const totalSKS = grades.reduce((acc, curr) => acc + curr.sks, 0);
    const totalPoints = grades.reduce((acc, curr) => acc + (curr.sks * curr.point), 0);
    const gpa = totalSKS > 0 ? (totalPoints / totalSKS).toFixed(2) : "0.00";

    // Calculate Predicate
    let predicate = "Belum Ada Predikat";
    if (gpa > 3.5) predicate = "Cum Laude 🏆";
    else if (gpa > 3.0) predicate = "Sangat Memuaskan 🌟";
    else if (gpa > 2.5) predicate = "Memuaskan 👍";
    else predicate = "Perlu Perbaikan ⚠️";

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header / Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">IPK Saat Ini</CardTitle>
                        <GraduationCap className="h-4 w-4 text-blue-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{gpa}</div>
                        <p className="text-xs text-blue-100 mt-1">Total {totalSKS} SKS</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Predikat</CardTitle>
                        <Award className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{predicate}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {gpa > 3.5 ? "Pertahankan!" : "Ayo tingkatkan!"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Daftar Nilai</h2>
                    <p className="text-muted-foreground">Riwayat akademikmu.</p>
                </div>
                <Button onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Tambah Nilai
                </Button>
            </div>

            {isAdding && (
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                        <form onSubmit={handleAddGrade} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="grid gap-2 flex-1">
                                <label className="text-sm font-medium">Semester</label>
                                <select
                                    className="p-2 rounded-md border bg-background"
                                    value={newGrade.semester}
                                    onChange={e => setNewGrade({ ...newGrade, semester: e.target.value })}
                                >
                                    {Array.from({ length: 14 }, (_, i) => i + 1).map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                            <div className="grid gap-2 flex-[2]">
                                <label className="text-sm font-medium">Mata Kuliah</label>
                                <input
                                    className="p-2 rounded-md border bg-background"
                                    placeholder="Contoh: Algoritma"
                                    value={newGrade.subject}
                                    onChange={e => setNewGrade({ ...newGrade, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2 flex-1">
                                <label className="text-sm font-medium">SKS</label>
                                <input
                                    type="number"
                                    className="p-2 rounded-md border bg-background"
                                    value={newGrade.sks}
                                    onChange={e => setNewGrade({ ...newGrade, sks: e.target.value })}
                                    min="1" max="6"
                                    required
                                />
                            </div>
                            <div className="grid gap-2 flex-1">
                                <label className="text-sm font-medium">Nilai</label>
                                <select
                                    className="p-2 rounded-md border bg-background"
                                    value={newGrade.grade}
                                    onChange={e => setNewGrade({ ...newGrade, grade: e.target.value })}
                                >
                                    {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>Simpan</Button>
                                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-6">
                {Array.from({ length: 14 }, (_, i) => i + 1).map(sem => {
                    const semGrades = grades.filter(g => g.semester === sem);
                    if (semGrades.length === 0) return null;

                    const semSKS = semGrades.reduce((acc, curr) => acc + curr.sks, 0);
                    const semPoints = semGrades.reduce((acc, curr) => acc + (curr.sks * curr.point), 0);
                    const semIPS = semSKS > 0 ? (semPoints / semSKS).toFixed(2) : "0.00";

                    return (
                        <Card key={sem}>
                            <CardHeader className="bg-muted/30 pb-3">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Semester {sem}</CardTitle>
                                    <div className="text-sm font-medium px-3 py-1 bg-background rounded-full border shadow-sm">
                                        IPS: <span className="text-blue-600 dark:text-blue-400 font-bold">{semIPS}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 border-y">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Mata Kuliah</th>
                                            <th className="text-center p-3 font-medium w-16">SKS</th>
                                            <th className="text-center p-3 font-medium w-16">Nilai</th>
                                            <th className="text-center p-3 font-medium w-16">Mutu</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {semGrades.map(g => (
                                            <tr key={g.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="p-3 font-medium">{g.subject}</td>
                                                <td className="p-3 text-center text-muted-foreground">{g.sks}</td>
                                                <td className="p-3 text-center font-bold">{g.grade}</td>
                                                <td className="p-3 text-center text-muted-foreground">{g.point}</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => handleDelete(g.id)}
                                                        className="text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    );
                })}

                {grades.length === 0 && !isAdding && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Calculator className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Belum ada nilai yang dimasukkan.</p>
                        <p className="text-sm">Klik "Tambah Nilai" untuk mulai menghitung IPK.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
