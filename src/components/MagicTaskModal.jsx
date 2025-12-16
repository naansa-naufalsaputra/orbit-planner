import { useState } from "react";
import { generateTasksFromPrompt } from "../lib/gemini";
import { Button } from "./ui/button";
import { Sparkles, Loader2, X, Check } from "lucide-react";

export default function MagicTaskModal({ isOpen, onClose, onAddTasks, userName }) {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedTasks, setGeneratedTasks] = useState(null);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    async function handleGenerate() {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError("");
        try {
            // Pass userName (or "Student" if undefined) to the AI
            const tasks = await generateTasksFromPrompt(prompt, userName || "Student");
            setGeneratedTasks(tasks);
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }

    function handleConfirm() {
        if (generatedTasks) {
            onAddTasks(generatedTasks);
            handleClose();
        }
    }

    function handleClose() {
        setPrompt("");
        setGeneratedTasks(null);
        setError("");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-lg rounded-xl border shadow-2xl p-6 m-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Sparkles className="h-5 w-5" />
                        <h2 className="text-xl font-bold">Magic Task Generator</h2>
                    </div>
                    <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {!generatedTasks ? (
                    <div className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                            Descibe your goal, and AI will break it down into actionable tasks.
                            <br />
                            <span className="text-xs opacity-70 italic">Example: "I need to study for History exam on Friday focusing on WW2."</span>
                        </p>
                        <textarea
                            className="w-full h-32 p-3 rounded-lg border bg-background focus:ring-2 ring-purple-500/20 focus:outline-none resize-none"
                            placeholder="What do you need to get done?"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            autoFocus
                        />
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Magic in progress...</> : "Generate Plan"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground">Here is a suggested plan:</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {generatedTasks.map((task, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-1 rounded mt-0.5">
                                        <Check className="h-3 w-3" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.description}</p>
                                        <p className="text-xs text-purple-500 mt-1">Due in {task.daysFromNow} days</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="ghost" onClick={() => setGeneratedTasks(null)}>Back</Button>
                            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 text-white">
                                Add {generatedTasks.length} Tasks
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
