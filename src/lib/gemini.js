import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    // Using generic alias 'gemini-flash-latest' which usually points to the stable free model
    model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
}

export async function generateTasksFromPrompt(prompt, userName = "Student") {
    if (!model) {
        throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const today = new Date();
    // System Prompt for Indonesian localization and Personalization
    const systemPrompt = `
    You are a smart student planner assistant acting as a personal mentor for ${userName}.
    Current Date: ${today.toDateString()} (Day of week: ${today.toLocaleDateString('en-US', { weekday: 'long' })}).

    Your Goal: Analyze the user's input and break it down into smaller, actionable tasks in INDONESIAN language.
    Tone: Friendly, encouraging, and productive.
    
    Return ONLY a JSON array of objects. Do not include markdown formatting or backticks.
    Each object should have:
    - title: (string) A concise task name in Indonesian
    - daysFromNow: (number) How many days from today (${today.toDateString()}) it should be due (0 for today, 1 for tomorrow, etc.)
    - description: (string) A very short tip for this task in Indonesian

    User Prompt: "${prompt}"
    `;

    try {
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Raw Response:", text); // Debug log

        // 1. Try cleaning markdown
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // 2. If that fails, try extracting array with regex
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            cleanText = jsonMatch[0];
        }

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Task Generation Error:", error);
        throw new Error(error.message || "Failed to generate tasks.");
    }
}

export async function generateMotivation(timeOfDay, userName = "Student") {
    if (!model) {
        return "Terus semangat, kamu pasti bisa! (API Key missing)";
    }

    const prompt = `
    Generate a short, inspiring, and unique motivational quote for a student named ${userName}. 
    The time of day is: ${timeOfDay}.
    Language: INDONESIAN.
    The quote should be concise (max 15 words). 
    Do not use famous quotes, generate a new one specifically for this student.
    Return ONLY the quote text, no quotes or explanations.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Quote Error:", error);
        return "Percayalah pada dirimu sendiri, kamu mampu melakukan hal-hal hebat.";
    }
}

export async function enhanceNoteContent(content, type, userContext = {}) {
    if (!model) {
        throw new Error("Gemini API Key is missing.");
    }

    let prompt = "";
    if (type === "grammar") {
        prompt = `
        Act as a professional editor. 
        Fix the grammar, spelling, and punctuation of the following text (detect language, output in same language but prefer Indonesian if ambiguous). 
        Improve clarity and flow but keep the original meaning and tone.
        Return ONLY the corrected text.

        Text: "${content}"
        `;
    } else if (type === "summarize") {
        prompt = `
        Summarize the following text into concise bullet points in INDONESIAN.
        Connect the topic to the user's major (${userContext.major || "General"}) if relevant.
        Capture the key ideas and main takeaways.
        User Focus: ${userContext.currentFocus || "General Study"}
        Tone: ${userContext.learningStyle || "Neutral"}
        Return ONLY the bullet points.

            Text: "${content}"
                `;
    } else {
        return content;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Enhancement Error:", error);
        throw new Error("Gagal memproses AI. Silakan coba lagi.");
    }
}

export async function generateQuizFromNote(noteContent, userContext = {}) {
    if (!model) {
        throw new Error("Gemini API Key is missing.");
    }

    const prompt = `
    Based on the following study notes, create a quiz with 5 multiple - choice questions.
            Language: INDONESIAN.
    
    Return ONLY a JSON array of objects.Do not use markdown backticks.
    
    User Context:
        - Major: ${userContext.major || "General"}
        - Focus: ${userContext.currentFocus || "General"}
        - Difficulty: ${userContext.learningStyle === 'Academic' ? 'Hard' : 'Medium'}

        Format:
        [
            {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0 // Index of the correct option (0-3)
            }
        ]

        Notes:
        "${noteContent}"
            `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Quiz Raw:", text);

        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        if (jsonMatch) cleanText = jsonMatch[0];

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Quiz Error:", error);
        throw new Error("Gagal membuat kuis. Coba lagi.");
    }
}
