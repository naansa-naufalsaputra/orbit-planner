export async function createCalendarEvent(task) {
    const accessToken = localStorage.getItem("googleAccessToken");

    if (!accessToken) {
        console.error("No access token found");
        return null;
    }

    const event = {
        summary: task.title,
        description: "Created via Orbit Student Planner",
        start: {
            date: task.dueDate // YYYY-MM-DD
        },
        end: {
            date: task.dueDate // For all-day events, end date is exclusive, so technically should be next day.
            // But for simplicity of this demo, we can just set start/end as date for all-day.
        }
    };

    try {
        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating calendar event:", error);
        throw error;
    }
}
