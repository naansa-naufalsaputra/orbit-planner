import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

export default function StudyCharts() {
    const { currentUser } = useAuth();
    const [focusData, setFocusData] = useState([]);
    const [taskData, setTaskData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        // 1. Fetch Focus Sessions (Last 7 Days) to keep it simple for now
        // Actually fetching all and filtering in client for small data volume is easier
        const focusQuery = query(
            collection(db, "focusSessions"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribeFocus = onSnapshot(focusQuery, (snapshot) => {
            const sessions = snapshot.docs.map(doc => doc.data());

            // Process Data: Group by Day of Week
            const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
            const weeklyStats = days.map(day => ({ name: day, minutes: 0 }));

            const now = new Date();
            // Logic: Just show accumulated stats by day name for simplicity or actual last 7 days?
            // Let's do actual days of current week or dynamic last 7 days.
            // Dynamic last 7 days is better.

            sessions.forEach(session => {
                if (!session.completedAt) return; // robustness
                const date = session.completedAt.toDate();
                const dayIndex = date.getDay(); // 0 = Sunday

                // Only count if within last 7 days? Or just all time grouped by day?
                // Let's do all time grouped by day for the "General Trend" visualization
                weeklyStats[dayIndex].minutes += session.durationMinutes || 25;
            });

            setFocusData(weeklyStats);
        });

        // 2. Fetch Tasks Stats
        const tasksQuery = query(
            collection(db, "tasks"),
            where("userId", "==", currentUser.uid)
        );

        const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
            let completed = 0;
            let pending = 0;

            snapshot.docs.forEach(doc => {
                if (doc.data().completed) completed++;
                else pending++;
            });

            setTaskData([
                { name: "Selesai", value: completed },
                { name: "Belum", value: pending }
            ]);
            setLoading(false);
        });

        return () => {
            unsubscribeFocus();
            unsubscribeTasks();
        };
    }, [currentUser]);

    const COLORS = ["#22c55e", "#ef4444"]; // Green for completed, Red for pending

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            {/* Bar Chart: Focus Time */}
            <Card className="col-span-4 shadow-sm border-none bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-muted/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Waktu Fokus (Menit)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={focusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}m`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="minutes"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    activeBar={{ fill: '#2563eb' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Pie Chart: Task Completion */}
            <Card className="col-span-3 shadow-sm border-none bg-gradient-to-br from-white to-purple-50 dark:from-background dark:to-muted/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <PieChartIcon className="h-5 w-5 text-purple-500" />
                        Status Tugas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex flex-col items-center justify-center">
                        {taskData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
                            <div className="text-center text-muted-foreground flex flex-col items-center">
                                <Activity className="h-10 w-10 mb-2 opacity-20" />
                                <p>Belum ada data tugas.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={taskData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {taskData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
