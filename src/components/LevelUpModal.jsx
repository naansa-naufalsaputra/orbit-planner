import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGamification } from "../context/GamificationContext";
import { Button } from "./ui/button";
import { Trophy, Star } from "lucide-react";

export default function LevelUpModal() {
    const { levelUpData, closeLevelUpModal } = useGamification();
    const { show, level } = levelUpData;

    useEffect(() => {
        if (show) {
            // Trigger Confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500', '#FF4500']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#00BFFF', '#1E90FF', '#4169E1']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [show]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 100 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative w-full max-w-md bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 rounded-3xl p-8 text-center border-4 border-yellow-400 shadow-[0_0_50px_rgba(255,215,0,0.5)]"
                    >
                        {/* Floating Stars Decoration */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-10 -right-10 text-yellow-500"
                        >
                            <Star size={64} fill="currentColor" />
                        </motion.div>
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-5 -left-5 text-yellow-500"
                        >
                            <Star size={48} fill="currentColor" />
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-32 h-32 bg-yellow-400 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl"
                        >
                            <Trophy size={64} className="text-white drop-shadow-md" />
                        </motion.div>

                        <h2 className="text-4xl font-black text-yellow-800 dark:text-yellow-100 mb-2 font-display uppercase tracking-wider">
                            Level Up!
                        </h2>

                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1.1 }}
                            transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-500 to-orange-600 mb-6 drop-shadow-sm"
                        >
                            {level}
                        </motion.div>

                        <p className="text-yellow-900/80 dark:text-yellow-100/80 mb-8 font-medium text-lg leading-relaxed">
                            Luar biasa! Kamu semakin pintar dan produktif. <br /> Terus pertahankan semangatmu! 🚀
                        </p>

                        <Button
                            onClick={closeLevelUpModal}
                            className="w-full text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
                            size="lg"
                        >
                            Lanjut Berjuang! 🔥
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
