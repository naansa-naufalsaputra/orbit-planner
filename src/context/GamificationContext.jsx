import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
// import { toast } from "sonner"; // Assuming sonner or generic alert

const GamificationContext = createContext();

export function useGamification() {
    return useContext(GamificationContext);
}

export function GamificationProvider({ children }) {
    const { currentUser } = useAuth();
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [badges, setBadges] = useState([]);
    const [levelUpData, setLevelUpData] = useState({ show: false, level: 1 });

    // Load initial data
    useEffect(() => {
        if (!currentUser) return;
        async function loadGameData() {
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setXp(data.xp || 0);
                    setLevel(data.level || 1);
                    setBadges(data.badges || []);
                }
            } catch (e) {
                console.error("Failed to load gamification data", e);
            }
        }
        loadGameData();
    }, [currentUser]);

    // Calculate level based on XP (Simple formula: Level = floor(XP / 100) + 1)
    useEffect(() => {
        const newLevel = Math.floor(xp / 100) + 1;
        if (newLevel > level) {
            setLevel(newLevel);
            // Trigger Level Up Event (UI handled by LevelUpModal)
            setLevelUpData({ show: true, level: newLevel });

            // Sync level to DB immediately
            if (currentUser) {
                updateDoc(doc(db, "users", currentUser.uid), { level: newLevel });
            }
        }
    }, [xp]);

    async function addXP(amount) {
        if (!currentUser) return;
        const newXp = xp + amount;
        setXp(newXp);

        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                xp: newXp
            });
        } catch (e) {
            console.error("Failed to save XP", e);
        }
    }

    async function unlockBadge(badgeId) {
        if (!currentUser || badges.includes(badgeId)) return;

        const newBadges = [...badges, badgeId];
        setBadges(newBadges);

        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                badges: arrayUnion(badgeId)
            });
            alert(`🏅 Badge Unlocked: ${badgeId}!`);
        } catch (e) {
            console.error("Failed to save badge", e);
        }
    }

    const value = {
        xp,
        level,
        badges,
        addXP,
        unlockBadge,
        levelUpData,
        closeLevelUpModal: () => setLevelUpData({ ...levelUpData, show: false }),
        xpToNextLevel: (Math.floor(xp / 100) + 1) * 100 - xp
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
}
