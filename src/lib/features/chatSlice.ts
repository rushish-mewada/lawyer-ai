import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';
import { RootState } from '@/lib/store';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import apiHelper from '@/utils/apiHelper';

interface GeminiMessageContent {
  main: string;
  disclaimer?: string;
}

interface Message {
  id: string;
  from: 'user' | 'gemini';
  content: string | GeminiMessageContent;
  attachment?: { url: string; name: string; type: string; };
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentChatId: string | null;
}

interface SendMessagePayload {
  text: string;
  file?: File;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  currentChatId: null,
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload, { dispatch, getState }) => {
    const state = getState() as RootState;
    let currentChatId = state.chat.currentChatId;

    let attachment;
    if (payload.file) {
      attachment = { url: URL.createObjectURL(payload.file), name: payload.file.name, type: payload.file.type };
    }

    const userMessage: Message = {
      id: nanoid(),
      from: 'user',
      content: payload.text || (payload.file ? `Review file: ${payload.file.name}` : ''),
      attachment,
      timestamp: Date.now()
    };
    dispatch(addMessage(userMessage));
    dispatch(setIsLoading(true));

    let errorMessage = "My apologies, I am currently unable to process your request due to an internal error.";

    try {
      const auth = getAuth(app);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found. Please log in.");
      }
      const idToken = await currentUser.getIdToken();

      const historyForAI = state.chat.messages.map(msg => ({
        role: msg.from === 'user' ? 'user' : 'model',
        parts: [{ text: typeof msg.content === 'string' ? msg.content : msg.content.main }],
      }));

      const data = await apiHelper<{ text: string, chatId?: string }>('/api/processMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: {
          text: payload.text,
          history: historyForAI,
          chatId: currentChatId,
        },
      });

      const disclaimerText = "This communication is for informational purposes only, does not constitute legal advice, and does not create an attorney-client relationship. LawBot is an AI and may produce inaccurate information.";
      const geminiResponse: Message = {
        id: nanoid(),
        from: 'gemini',
        content: {
          main: data.text.replace(disclaimerText, "").trim(),
          disclaimer: disclaimerText,
        },
        timestamp: Date.now(),
      };
      dispatch(addMessage(geminiResponse));

      if (data.chatId && data.chatId !== currentChatId) {
        dispatch(setCurrentChatId(data.chatId));
      }

    } catch (error) {
      const errorResponse: Message = { id: nanoid(), from: 'gemini', content: errorMessage, timestamp: Date.now() };
      dispatch(addMessage(errorResponse));
    } finally {
      dispatch(setIsLoading(false));
    }
  }
);

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentChatId: (state, action: PayloadAction<string | null>) => {
      state.currentChatId = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.currentChatId = null;
      state.isLoading = false;
    },
  },
});

export const { addMessage, setIsLoading, setCurrentChatId, clearChat } = chatSlice.actions;
export default chatSlice.reducer;