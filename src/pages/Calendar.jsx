import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { cn } from "../lib/utils";

export default function CalendarPage() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "tasks"), where("userId", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(data);
        });
        return unsubscribe;
    }, [currentUser]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        // 0 = Sunday, 1 = Monday, ... 
        // Adjust so 0 = Monday (if we want Monday start)
        // Standard Date.getDay(): 0=Sun. Let's stick to Sunday start for simplicity or standard.
        return new Date(year, month, 1).getDay();
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
                <div className="flex items-center gap-4 bg-card border px-4 py-2 rounded-lg">
                    <button onClick={prevMonth} className="p-1 hover:bg-muted rounded-full"><ChevronLeft /></button>
                    <span className="font-semibold min-w-[140px] text-center">{monthNames[month]} {year}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-muted rounded-full"><ChevronRight /></button>
                </div>
            </div>

            <div className="bg-card border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b bg-muted/30">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="p-4 text-center font-medium text-sm text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1">
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} className="border-b border-r bg-muted/5 p-4" />;

                        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD (local logic caveat: generic ISO is UTC, but for simple matching date object comparison is safer)
                        // Proper local YYYY-MM-DD
                        const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

                        const dayTasks = tasks.filter(t => t.dueDate === localDateStr);
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                            <div key={idx} className={cn("border-b border-r p-2 relative group transition-colors hover:bg-muted/30 flex flex-col items-start gap-1", isToday && "bg-primary/5")}>
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                    isToday ? "bg-primary text-primary-foreground" : "text-gray-700 dark:text-gray-300"
                                )}>
                                    {date.getDate()}
                                </span>

                                <div className="flex flex-col gap-1 w-full overflow-y-auto max-h-[80px] no-scrollbar">
                                    {dayTasks.map(task => (
                                        <div key={task.id} className={cn("text-[10px] px-1.5 py-0.5 rounded truncate w-full", task.completed ? "bg-muted text-muted-foreground line-through" : "bg-primary/10 text-primary")}>
                                            {task.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
