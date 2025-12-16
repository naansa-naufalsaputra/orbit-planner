import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Plus, Trash2, Calendar as CalendarIcon, CheckCircle, Circle, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import MagicTaskModal from "../components/MagicTaskModal";
import { createCalendarEvent } from "../lib/googleCalendar";
import { format } from "date-fns";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

export default function Tasks() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const q = query(
            collection(db, "tasks"),
            where("userId", "==", currentUser.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort: Pending first, then by deadline
            data.sort((a, b) => {
                if (a.completed === b.completed) {
                    return new Date(a.dueDate || 9999999999999) - new Date(b.dueDate || 9999999999999);
                }
                return a.completed ? 1 : -1;
            });
            setTasks(data);
        });
        return unsubscribe;
    }, [currentUser]);

    async function handleAddTask(e) {
        e.preventDefault();
        if (!newTask.trim()) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "tasks"), {
                userId: currentUser.uid,
                title: newTask,
                dueDate: dueDate,
                completed: false,
                createdAt: serverTimestamp()
            });

            // Sync to Google Calendar
            const shouldSync = document.getElementById("syncGoogle")?.checked;
            if (shouldSync && dueDate) {
                try {
                    await createCalendarEvent({ title: newTask, dueDate });
                } catch (err) {
                    console.error("Failed to sync to calendar", err);
                    alert("Task saved, but failed to sync to Google Calendar. Please Try Logging In again to grant permissions.");
                }
            }

            setNewTask("");
            setDueDate("");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function toggleComplete(task) {
        try {
            await updateDoc(doc(db, "tasks", task.id), {
                completed: !task.completed
            });
        } catch (e) {
            console.error(e);
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this task?")) return;
        try {
            await deleteDoc(doc(db, "tasks", id));
        } catch (e) {
            console.error(e);
        }
    }

    const [showMagicModal, setShowMagicModal] = useState(false);

    async function handleAddMagicTasks(generatedTasks) {
        setLoading(true);
        try {
            const batchPromises = generatedTasks.map(task => {
                const date = new Date();
                date.setDate(date.getDate() + task.daysFromNow);
                const dateString = date.toISOString().split('T')[0];

                return addDoc(collection(db, "tasks"), {
                    userId: currentUser.uid,
                    title: task.title,
                    dueDate: dateString,
                    completed: false,
                    createdAt: serverTimestamp()
                });
            });
            await Promise.all(batchPromises);
        } catch (e) {
            console.error(e);
            alert("Failed to add tasks");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8 select-none">
            <MagicTaskModal
                isOpen={showMagicModal}
                onClose={() => setShowMagicModal(false)}
                onAddTasks={handleAddMagicTasks}
                userName={currentUser?.displayName}
            />

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
                    <p className="text-muted-foreground">Stay on top of your assignments.</p>
                </div>
                <Button
                    onClick={() => setShowMagicModal(true)}
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-900 dark:text-purple-400 dark:hover:bg-purple-950/30"
                >
                    <Sparkles className="mr-2 h-4 w-4" /> Magic Add
                </Button>
            </div>

            <Card className="mb-8">
                <CardContent className="p-4">
                    <form onSubmit={handleAddTask} className="flex flex-col md:flex-row gap-4">
                        <input
                            className="flex-1 p-3 rounded-md border bg-background"
                            placeholder="Add a new task..."
                            value={newTask}
                            onChange={e => setNewTask(e.target.value)}
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[200px] justify-start text-left font-normal h-12",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(new Date(dueDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dueDate ? new Date(dueDate) : undefined}
                                    onSelect={(date) => setDueDate(date ? date.toISOString().split('T')[0] : "")}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button type="submit" disabled={loading}>
                            <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </form>
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="syncGoogle"
                            className="accent-primary h-4 w-4"
                            defaultChecked
                        />
                        <label htmlFor="syncGoogle" className="text-sm text-muted-foreground cursor-pointer">Sync to Google Calendar</label>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {tasks.map(task => {
                    const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
                    return (
                        <div
                            key={task.id}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border bg-card transition-all group",
                                task.completed ? "opacity-60 bg-muted/50" : "hover:shadow-md",
                                isOverdue ? "border-destructive/50" : ""
                            )}
                        >
                            <button
                                onClick={() => toggleComplete(task)}
                                className={cn("text-muted-foreground transition-colors", task.completed ? "text-primary" : "hover:text-primary")}
                            >
                                {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <p className={cn("font-medium truncate", task.completed && "line-through text-muted-foreground")}>
                                    {task.title}
                                </p>
                                {task.dueDate && (
                                    <div className={cn("flex items-center gap-1 text-xs mt-1", isOverdue ? "text-destructive font-bold" : "text-muted-foreground")}>
                                        <CalendarIcon size={12} />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                        {isOverdue && <span>(Overdue)</span>}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleDelete(task.id)}
                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    );
                })}
                {tasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>All caught up! No tasks found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
