import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { MessageType, type Message } from './types';

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY;

function loadPersisted(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // minimal validation
    return data.filter(
      (m) =>
        m &&
        typeof m.id === 'string' &&
        typeof m.data === 'string' &&
        typeof m.isUser === 'boolean'
    );
  } catch (e) {
    console.log('Failed to parse stored messages', e);
    return [];
  }
}

interface ChatState {
  messages: Message[];
}

const persisted = loadPersisted();

const initialState: ChatState = {
  messages:
    persisted.length > 0
      ? persisted
      : [
          {
            id: crypto.randomUUID(),
            isUser: false,
            data: 'Welcome to Vision AI!',
            type: MessageType.text,
          },
        ],
};

export const chatSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },

    loadMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    // Append content to an existing message's data field
    updateMessage: (
      state,
      action: PayloadAction<{ id: string; content: string; replace?: boolean }>
    ) => {
      const { id, content, replace } = action.payload;
      const msg = state.messages.find((message) => message.id === id);
      if (msg) {
        msg.data = replace ? content : msg.data + content;
      }
    },

    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, updateMessage, clearMessages, loadMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
