export const quotes = {
    morning: [
        "Rise up and attack the day with enthusiasm.",
        "Every morning is a new arrival. A new chapter in your life.",
        "Wake up with determination. Go to bed with satisfaction.",
        "Today is a new day. Even if you were wrong yesterday, you can get it right today.",
        "Opportunities are like sunrises. If you wait too long, you miss them.",
        "The sun is a daily reminder that we too can rise again from the darkness, that we too can shine our own light.",
        "Make today so awesome yesterday gets jealous.",
        "Your future is created by what you do today, not tomorrow.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Believe you can and you're halfway there."
    ],
    afternoon: [
        "Keep pushing, you're halfway there!",
        "Don't stop when you're tired. Stop when you're done.",
        "Focus on being productive instead of busy.",
        "The only way to do great work is to love what you do.",
        "Small progress is still progress.",
        "It always seems impossible until it's done.",
        "Your only limit is your mind.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones.",
        "Dream it. Wish it. Do it."
    ],
    evening: [
        "Reflect on your progress and plan for tomorrow.",
        "The best preparation for tomorrow is doing your best today.",
        "Don't watch the clock; do what it does. Keep going.",
        "It does not matter how slowly you go as long as you do not stop.",
        "Success usually comes to those who are too busy to be looking for it.",
        "Review your day. What went well? What can be better?",
        "Even the darkest night will end and the sun will rise.",
        "Finish the day strong.",
        "Be proud of what you achieved today.",
        "Relax, recharge, and get ready for a better tomorrow."
    ],
    night: [
        "Rest is just as important as work. Sleep well.",
        "Sleep is the best meditation.",
        "Tomorrow is another chance to make things right.",
        "Let go of today. Embrace tomorrow.",
        "Good night. Sleep tight. Wake up bright.",
        "Clear your mind. Your problems will wait until morning.",
        "The stars can't shine without darkness.",
        "Rest your head and let your dreams take flight.",
        "Peace is the best pillow.",
        " Recharge your soul. Tomorrow needs your energy."
    ]
};

export function getRandomQuote(timeOfDay) {
    const categoryDefaults = {
        morning: "morning",
        afternoon: "afternoon",
        evening: "evening",
        night: "night"
    };

    const category = categoryDefaults[timeOfDay] || "morning";
    const quoteList = quotes[category];
    const randomIndex = Math.floor(Math.random() * quoteList.length);
    return quoteList[randomIndex];
}
