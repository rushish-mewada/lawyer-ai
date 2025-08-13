import { GoogleGenerativeAI, Part, Content } from "@google/generative-ai";
import { NextResponse } from "next/server";

const getOptimizedHistory = (history: Content[], maxMessages: number = 8) => {
  if (history.length <= maxMessages) {
    return history;
  }
  
  const firstMessage = history.slice(0, 1);
  const lastMessages = history.slice(-maxMessages);
  
  const middleSummary = {
    role: "model",
    parts: [{ text: `[... earlier parts of the conversation were summarized or omitted for brevity ...]` }],
  };

  return [...firstMessage, middleSummary, ...lastMessages];
};

export async function POST(req: Request) {
  return new Promise<NextResponse>(async (resolve) => {
    try {
      const { text, history } = await req.json();

      if (!process.env.GEMINI_API_KEY) {
        return resolve(new NextResponse("Missing Gemini API Key", { status: 500 }));
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

      const initialSystemPrompt: Content[] = [
        {
          role: "user",
          parts: [{ text: "You are an expert lawyer AI named LawBot. Your tone is professional, formal, and cautious. Format your responses using Markdown, including paragraphs for explanations, bullet points for lists, and numbered lists for steps to ensure clean, readable output like ChatGPT. If a user asks a question that is not legal in nature, you must respond with this exact text: 'My function is strictly limited to legal matters. I cannot provide medical advice. Please consult a qualified professional for health concerns.' Do not provide any other information or attempts to answer the non-legal query." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am LawBot. I will maintain a professional, formal, and cautious tone, format my responses in Markdown like ChatGPT, and strictly decline non-legal queries with the provided text." }],
        },
      ];
      
      const optimizedHistory = getOptimizedHistory(history || []);
      const fullHistory = [...initialSystemPrompt, ...optimizedHistory];

      const chat = model.startChat({
        history: fullHistory,
        generationConfig: {
          maxOutputTokens: 2000,
        },
      });

      const result = await chat.sendMessage(text);
      const response = await result.response;
      const responseText = response.text();

      return resolve(NextResponse.json({ text: responseText }));

    } catch (error) {
      console.error("API Route Error:", error);
      return resolve(new NextResponse("Internal Server Error", { status: 500 }));
    }
  });
}
