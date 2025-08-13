import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { NextResponse, NextRequest } from "next/server";
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (!serviceAccountPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.');
      }

      const fullPath = path.resolve(process.cwd(), serviceAccountPath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`Firebase service account file not found at: ${fullPath}`);
      }

      const serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
      throw error;
    }
  }
}

initializeFirebaseAdmin();

const db = admin.firestore();

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

async function generateChatTitle(firstMessageText: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing Gemini API Key for title generation.");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const prompt = `Based on the following first message of a chat, generate a concise title (max 5 words). The title should be descriptive of the conversation topic. Return only the title text, no extra formatting or punctuation.
  First message: "${firstMessageText}"
  Title:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let title = response.text().trim();
    title = title.replace(/[/#?*[]]/g, '').replace(/\s+/g, '-');
    title = title.substring(0, 80);
    return title || `Chat-${nanoid(8)}`;
  } catch (error) {
    console.error("Error generating chat title:", error);
    return `Chat-${nanoid(8)}`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, history, chatId: incomingChatId } = await req.json();

    const idToken = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'Authorization token not provided' }, { status: 401 });
    }

    let userEmail: string;
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (!decodedToken.email) {
        throw new Error('User email not found in token.');
      }
      userEmail = decodedToken.email;
    } catch (error) {
      console.error('Error verifying Firebase ID token or extracting email:', error);
      return NextResponse.json({ message: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    if (typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ message: 'Invalid or missing message text' }, { status: 400 });
    }

    let currentChatDocumentId = incomingChatId;
    let isNewConversation = !incomingChatId;

    if (isNewConversation) {
      currentChatDocumentId = await generateChatTitle(text);
      let docExists = (await db.collection('users').doc(userEmail).collection('chats').doc(currentChatDocumentId).get()).exists;
      let attempt = 0;
      const originalTitle = currentChatDocumentId;
      while (docExists && attempt < 5) {
        attempt++;
        currentChatDocumentId = `${originalTitle}-${nanoid(4)}`;
        docExists = (await db.collection('users').doc(userEmail).collection('chats').doc(currentChatDocumentId).get()).exists;
      }
      if (docExists) {
        currentChatDocumentId = `Chat-${nanoid(8)}`;
      }
    }
    
    const userChatsCollectionRef = db.collection('users').doc(userEmail).collection('chats');
    const currentChatDocRef = userChatsCollectionRef.doc(currentChatDocumentId);

    const newUserMessageContent: Content = {
      role: "user",
      parts: [{ text: text }],
    };

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
    const fullHistoryForGemini = [...initialSystemPrompt, ...optimizedHistory, newUserMessageContent];

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key on server.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const chat = model.startChat({
      history: fullHistoryForGemini,
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });
    const result = await chat.sendMessage(text);
    const response = await result.response;
    const responseText = response.text();

    const disclaimerText = "This communication is for informational purposes only, does not constitute legal advice, and does not create an attorney-client relationship. LawBot is an AI and may produce inaccurate information.";
    
    const newGeminiMessageContent: Content = {
      role: "model",
      parts: [{ text: responseText }],
    };

    const updatedMessages = [...history, newUserMessageContent, newGeminiMessageContent];

    await currentChatDocRef.set({
      title: isNewConversation ? currentChatDocumentId : admin.firestore.FieldValue.delete(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: isNewConversation ? admin.firestore.FieldValue.serverTimestamp() : admin.firestore.FieldValue.delete(),
      messages: updatedMessages,
    }, { merge: true });

    return NextResponse.json({ text: responseText, chatId: currentChatDocumentId }, { status: 200 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
