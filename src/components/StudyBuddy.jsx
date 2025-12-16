import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";

// Public free Lottie JSON for a "Cute Robot"
// Source: LottieFiles (Free License)
const ROBOT_ANIMATION_URL = "https://assets5.lottiefiles.com/packages/lf20_3d2263e8-5431-4040-9759-335160161474.json";
// Fallback if that one is heavy/broken, we can use a simpler one. 
// Using a stable direct link often used in demos:
const CUTE_BOT_URL = "https://lottie.host/5c6b4478-4330-4c31-8977-1335ae154098/9wN13t7W2o.json";

const QUOTES = [
    "Semangat belajarnya! 🚀",
    "Kamu pasti bisa! 💪",
    "Jangan lupa minum air! 💧",
    "Istirahat itu penting lho. ☕",
    "Fokus, fokus, trus lulus! 🎓",
    "Masa depan cerah menanti! ☀️",
    "Satu tugas selesai, satu langkah maju! 👣",
    "Hari ini produktif banget! 🔥",
    "Coding itu seru kan? 💻",
    "Orbit planner siap bantu! 🪐"
];

export default function StudyBuddy() {
    const [message, setMessage] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [animationData, setAnimationData] = useState(null);

    // Fetch the animation data on mount
    useEffect(() => {
        fetch("https://lottie.host/80c65538-4e3e-4614-9b34-11e25e982121/C9c2A4Hj7r.json")
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error("Failed to load mascot:", err));
    }, []);

    // Initial greeting
    useEffect(() => {
        setTimeout(() => {
            setMessage("Halo! Aku Orbit Buddy! 👋");
        }, 1000);
    }, []);

    // Auto-hide message after 4 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage("");
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handlePoke = () => {
        const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        setMessage(randomQuote);
    };

    const constraintsRef = useRef(null);

    if (!isVisible) return null;

    return (
        <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-50">
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                whileHover={{ cursor: "grab" }}
                whileDrag={{ cursor: "grabbing" }}
                className="absolute bottom-24 md:bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-auto"
            >
                {/* Speech Bubble */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10, x: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-xl border border-blue-100 dark:border-blue-900 max-w-[200px] text-sm font-medium relative shadow-blue-500/10"
                        >
                            {message}
                            <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 skew-x-12 translate-x-[-10px] border-b border-r border-blue-100 dark:border-blue-900"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mascot Container */}
                <div className="relative group w-32 h-32 md:w-40 md:h-40">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePoke}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="w-full h-full drop-shadow-2xl hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all"
                        role="button"
                        aria-label="Orbit Buddy Mascot"
                    >
                        {animationData ? (
                            <Lottie
                                animationData={animationData}
                                loop={true}
                                autoplay={true}
                            />
                        ) : (
                            <div className="text-[4rem] text-center pt-4 animate-bounce">🤖</div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
