import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

export default function FocusTimer() {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [mode, setMode] = useState('focus'); // 'focus' or 'rest'
    const intervalRef = useRef(null);

    // Audio for notification (using a simple data URI beep or just visual for now)
    // For web, simple beep is tricky without user interaction allowed first. 
    // We'll rely on visual cues.

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer finished
            setIsActive(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Auto switch mode (conceptually)
            if (mode === 'focus') {
                alert("Waktu fokus selesai! Istirahat sebentar yuk. ☕");
                setMode('rest');
                setTimeLeft(5 * 60);
            } else {
                alert("Istirahat selesai! Kembali fokus yuk. ⚡");
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = mode === 'focus'
        ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
        : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

    return (
        <Card className="h-full border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-16 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {mode === 'focus' ? <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" /> : <Coffee className="h-5 w-5 text-amber-600" />}
                    {mode === 'focus' ? "Mode Fokus" : "Waktu Istirahat"}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 pt-2">

                {/* Timer Display */}
                <div className="relative flex items-center justify-center">
                    {/* Ring SVG */}
                    <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            className="text-muted/20"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (440 * progress) / 100}
                            className={cn(
                                "transition-all duration-1000 ease-linear",
                                mode === 'focus' ? "text-blue-500" : "text-green-500"
                            )}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold font-mono tracking-tighter">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                            {isActive ? "Berjalan" : "Jeda"}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-12 w-12 rounded-full hover:scale-110 transition-transform shadow-sm"
                        onClick={resetTimer}
                        title="Reset"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                    <Button
                        size="icon"
                        className={cn(
                            "h-14 w-14 rounded-full hover:scale-110 transition-transform shadow-md",
                            isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"
                        )}
                        onClick={toggleTimer}
                    >
                        {isActive ? <Pause className="h-6 w-6 fill-white text-white" /> : <Play className="h-6 w-6 fill-white text-white pl-1" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
