import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Trash2, Save, X, Search, Palette, Sparkles, Wand2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Skeleton } from "../components/ui/skeleton";
import { enhanceNoteContent } from "../lib/gemini";

const COLORS = [
    { name: "Default", value: "bg-card" },
    { name: "Red", value: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900" },
    { name: "Blue", value: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900" },
    { name: "Green", value: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900" },
    { name: "Yellow", value: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900" },
    { name: "Purple", value: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900" },
];

export default function Notes() {
    const { currentUser } = useAuth();
    const [notes, setNotes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNote, setCurrentNote] = useState({ title: "", content: "", color: "bg-card" });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!currentUser) return;

        // Subscribe to notes
        const q = query(
            collection(db, "notes"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by updated at desc
            notesData.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
            setNotes(notesData);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    async function handleSave() {
        if (!currentNote.title.trim()) return;
        setLoading(true);
        try {
            const noteData = {
                title: currentNote.title,
                content: currentNote.content,
                color: currentNote.color || "bg-card",
                updatedAt: serverTimestamp()
            };

            if (currentNote.id) {
                await updateDoc(doc(db, "notes", currentNote.id), noteData);
            } else {
                await addDoc(collection(db, "notes"), {
                    userId: currentUser.uid,
                    ...noteData,
                    createdAt: serverTimestamp(),
                });
            }
            setIsEditing(false);
            setCurrentNote({ title: "", content: "", color: "bg-card" });
        } catch (e) {
            console.error("Error saving note: ", e);
            alert("Error saving note.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            await deleteDoc(doc(db, "notes", id));
        } catch (e) {
            console.error(e);
        }
    }

    async function handleEnhance(type) {
        if (!currentNote.content.trim()) return;
        setLoading(true);
        try {
            const enhancedText = await enhanceNoteContent(currentNote.content, type);
            if (type === "summarize") {
                // For summary, maybe append it or specific interactions. For now let's just replace or append? 
                // Let's ask user? Or just append.
                // Actually safer to append for summary. 
                // For grammar, replace.
                if (type === "summarize") {
                    setCurrentNote(prev => ({ ...prev, content: prev.content + "\n\n**Summary:**\n" + enhancedText }));
                } else {
                    setCurrentNote(prev => ({ ...prev, content: enhancedText }));
                }
            } else {
                setCurrentNote(prev => ({ ...prev, content: enhancedText }));
            }
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes</h1>

                {!isEditing && (
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search notes..."
                                className="w-full pl-9 p-2 rounded-md border bg-background text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => { setIsEditing(true); setCurrentNote({ title: "", content: "", color: "bg-card" }); }}>
                            <Plus className="mr-2 h-4 w-4" /> New Note
                        </Button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className={cn("flex-1 flex flex-col gap-4 rounded-xl border p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300", currentNote.color)}>
                    <input
                        className="text-2xl font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/70 w-full"
                        placeholder="Note Title"
                        value={currentNote.title}
                        onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                        autoFocus
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {COLORS.map(c => (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => setCurrentNote({ ...currentNote, color: c.value })}
                                className={cn(
                                    "w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110",
                                    c.value, // Apply full class string for dark mode support
                                    currentNote.color === c.value && "ring-2 ring-primary ring-offset-2"
                                )}
                                title={c.name}
                            />
                        ))}
                    </div>

                    <textarea
                        className="flex-1 w-full resize-none bg-transparent border-none focus:outline-none text-lg p-2 leading-relaxed"
                        placeholder="Start typing..."
                        value={currentNote.content}
                        onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                    />

                    {/* AI Enhancement Toolbar */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 rounded-lg w-fit mb-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium text-muted-foreground mr-1">AI Magic:</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30"
                            onClick={() => handleEnhance("grammar")}
                            disabled={loading || !currentNote.content}
                        >
                            Perbaiki Tata Bahasa
                        </Button>
                        <div className="h-4 w-[1px] bg-border" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30"
                            onClick={() => handleEnhance("summarize")}
                            disabled={loading || !currentNote.content}
                        >
                            Buat Ringkasan
                        </Button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto pb-20">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[125px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))
                    ) : filteredNotes.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-muted/50 p-4 rounded-full mb-4">
                                {searchQuery ? <Search className="h-8 w-8 text-muted-foreground" /> : <Plus className="h-8 w-8 text-muted-foreground" />}
                            </div>
                            <h3 className="text-lg font-medium mt-4">
                                {searchQuery ? "No matching notes found" : "No notes yet"}
                            </h3>
                            <p className="mb-4">
                                {searchQuery ? "Try a different search term." : "Create your first note to get started."}
                            </p>
                            {!searchQuery && (
                                <Button onClick={() => { setIsEditing(true); setCurrentNote({ title: "", content: "", color: "bg-card" }); }}>
                                    Create Note
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredNotes.map(note => (
                            <Card
                                key={note.id}
                                className={cn(
                                    "cursor-pointer hover:shadow-md transition-all group relative border",
                                    note.color !== "bg-card" ? note.color : "bg-card hover:border-primary/50"
                                )}
                                onClick={() => { setIsEditing(true); setCurrentNote(note); }}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="line-clamp-1 text-lg">{note.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground line-clamp-3 text-sm h-12">
                                        {note.content || "No content"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-4">
                                        {note.updatedAt?.seconds ? new Date(note.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </p>
                                </CardContent>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                                    title="Delete Note"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
