import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '@/components/chat-ui/chatSlice';

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY;

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

try {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(store.getState().chat.messages)
  );
} catch {
  /* */
}

store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.chat.messages));
  } catch {
    /* */
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
