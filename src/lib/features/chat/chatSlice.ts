import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from 'nanoid';

interface GeminiMessageContent {
  main: string;
  disclaimer?: string;
}

interface Message {
  id: string;
  from: 'user' | 'gemini';
  content: string | GeminiMessageContent;
  attachment?: { url: string; name: string; type: string; };
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

interface SendMessagePayload {
  text: string;
  file?: File;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
};

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendMessagePayload, { dispatch }) => {
    let attachment;
    if (payload.file) {
      attachment = { url: URL.createObjectURL(payload.file), name: payload.file.name, type: payload.file.type };
    }

    const userMessage: Message = { id: nanoid(), from: 'user', content: payload.text || `Review file: ${payload.file?.name}`, attachment };
    dispatch(addMessage(userMessage));
    dispatch(setIsLoading(true));

    let errorMessage = "My apologies, I am currently unable to process your request due to an internal error.";

    try {
      const apiResponse = await fetch('/api/chatAPI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payload.text }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        errorMessage = `Error: ${errorData.error || apiResponse.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await apiResponse.json();
      
      const disclaimerText = "This communication is for informational purposes only, does not constitute legal advice, and does not create an attorney-client relationship. LawBot is an AI and may produce inaccurate information.";
      const geminiResponse: Message = {
        id: nanoid(),
        from: 'gemini',
        content: {
          main: data.text.replace(disclaimerText, "").trim(),
          disclaimer: disclaimerText,
        }
      };
      dispatch(addMessage(geminiResponse));

    } catch (error) {
      const errorResponse: Message = { id: nanoid(), from: 'gemini', content: errorMessage };
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
  },
});

export const { addMessage, setIsLoading } = chatSlice.actions;
export default chatSlice.reducer;