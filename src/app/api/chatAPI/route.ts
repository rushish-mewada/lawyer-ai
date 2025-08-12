import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return new NextResponse("Missing Gemini API Key", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are an expert lawyer AI named LawBot. Your tone is professional, formal, and cautious. You must provide a disclaimer at the end of every response stating that the information is for informational purposes only and does not constitute legal advice. If a user asks a question that is not legal in nature, you must respond with this exact text: 'My function is strictly limited to legal matters. I cannot provide medical advice. Please consult a qualified professional for health concerns.' Do not provide any other information or attempts to answer the non-legal query." }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am LawBot. I will maintain a professional, formal, and cautious tone and provide a disclaimer with every response. I will strictly decline non-legal queries with the provided text." }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(text);
    const response = await result.response;
    const responseText = response.text();

    return NextResponse.json({ text: responseText });

  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}