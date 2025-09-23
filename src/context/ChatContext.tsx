import { createContext, useContext } from 'react';
import type { Message } from '../components/chat-ui/types';

interface ChatContextType {
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
