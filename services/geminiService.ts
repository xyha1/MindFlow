import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const baseUrl = process.env.API_BASE_URL;

// Initialize with baseUrl if it exists (for proxying)
const options: any = { apiKey };
if (baseUrl) {
  options.baseUrl = baseUrl;
}

const ai = apiKey ? new GoogleGenAI(options) : null;

export const checkSystemStatus = async (): Promise<{ok: boolean, message: string}> => {
  if (!ai) return { ok: false, message: "AI Client not initialized (Missing API Key)" };
  try {
    // Simple ping to check if key works
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping',
    });
    return { ok: true, message: "AI System Operational!" };
  } catch (error: any) {
    console.error("Diagnostic Error:", error);
    return { ok: false, message: error.message || "Connection Failed" };
  }
};

export const generateSubtasks = async (task: string): Promise<string[]> => {
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Break down the following task into 3-5 concise, actionable sub-tasks. Return ONLY the sub-tasks as a JSON array of strings. Task: "${task}"`,
      config: {
        responseMimeType: 'application/json',
      }
    });
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const expandIdea = async (idea: string): Promise<string> => {
  if (!ai) return "AI service unavailable";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a creative partner. Briefly expand on this idea with a unique perspective or a concrete next step. Keep it under 50 words. Idea: "${idea}"`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};

export const suggestEventTitle = async (input: string): Promise<{title: string, date?: string, time?: string}> => {
  if (!ai) return { title: input };
  
  // Get current date context in user's locale to handle "tomorrow", "next friday" etc.
  const now = new Date();
  const contextDate = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

  try {
      const prompt = `
        Current reference date: ${contextDate} (${dayOfWeek}).
        
        Analyze the following text and extract:
        1. Event Title (clean up the text, remove the time/date references).
        2. Date (YYYY-MM-DD). Calculate specific dates for relative terms like "tomorrow", "next friday", "in 3 days", "后天" (2 days after today), "下周三" (next Wed). If no date is mentioned, return null.
        3. Time (HH:MM) in 24-hour format. If no time is mentioned, return null.

        Text: "${input}"
        
        Return JSON: { "title": string, "date": string | null, "time": string | null }
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
      });
      const text = response.text;
      if (!text) return { title: input };
      return JSON.parse(text);
  } catch (e) {
      console.error("Date parsing error", e);
      return { title: input };
  }
}