import { useState } from "react";
import { Button } from "./ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
// import { CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy } from "lucide-react";
import { cn } from "../lib/utils";

export default function QuizModal({ isOpen, onClose, quizData, noteTitle }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    if (!quizData || quizData.length === 0) return null;

    const currentQuestion = quizData[currentIndex];

    function handleOptionClick(index) {
        if (selectedOption !== null) return; // Prevent changing answer
        setSelectedOption(index);
        setShowResult(true);
        if (index === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    }

    function handleNext() {
        if (currentIndex < quizData.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            setIsFinished(true);
        }
    }

    function handleRetry() {
        setCurrentIndex(0);
        setSelectedOption(null);
        setShowResult(false);
        setScore(0);
        setIsFinished(false);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card w-full max-w-lg rounded-xl border-2 border-primary/20 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {!isFinished ? (
                    <>
                        <div className="bg-primary/10 p-4 border-b border-primary/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-primary">Kuis: {noteTitle}</h3>
                                <p className="text-xs text-muted-foreground">Pertanyaan {currentIndex + 1} dari {quizData.length}</p>
                            </div>
                            <div className="text-sm font-bold bg-background px-3 py-1 rounded-full border">
                                Skor: {score}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <p className="text-lg font-medium leading-relaxed">
                                {currentQuestion.question}
                            </p>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option, idx) => {
                                    let contentClass = "hover:bg-muted/50 border-input";
                                    // let icon = null;

                                    if (showResult) {
                                        if (idx === currentQuestion.correctAnswer) {
                                            contentClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300 font-medium";
                                            // icon = <CheckCircle className="h-4 w-4 text-green-600" />;
                                        } else if (idx === selectedOption) {
                                            contentClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300";
                                            // icon = <XCircle className="h-4 w-4 text-red-600" />;
                                        } else {
                                            contentClass = "opacity-50";
                                        }
                                    } else if (selectedOption === idx) {
                                        contentClass = "border-primary bg-primary/5 ring-1 ring-primary";
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleOptionClick(idx)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-xl border text-sm transition-all cursor-pointer",
                                                contentClass
                                            )}
                                        >
                                            <span>{option}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-4 bg-muted/20 border-t flex justify-end">
                            <Button
                                onClick={handleNext}
                                disabled={!showResult}
                                className="w-full gap-2"
                            >
                                {currentIndex === quizData.length - 1 ? "Lihat Hasil" : "Lanjut"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center space-y-6">
                        <div className="mx-auto w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                            {/* <Trophy className="h-12 w-12 text-yellow-600 dark:text-yellow-400 animate-bounce" /> */}
                            <span className="text-4xl">🏆</span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-2">Selesai!</h2>
                            <p className="text-muted-foreground">Kamu berhasil menjawab</p>
                            <p className="text-4xl font-black text-primary my-4">{score} / {quizData.length}</p>
                            <p className="text-sm text-muted-foreground">
                                {score === quizData.length ? "Sempurna! Kamu menguasai materi ini. 🎉" :
                                    score > quizData.length / 2 ? "Bagus! Tingkatkan lagi belajarmu. 👍" :
                                        "Tetap semangat! Coba baca ulang catatanmu. 💪"}
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center pt-4">
                            <Button variant="outline" onClick={onClose}>Tutup</Button>
                            <Button onClick={handleRetry} className="gap-2">
                                Ulangi Kuis
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
