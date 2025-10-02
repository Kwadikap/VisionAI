import React, { useCallback, useState } from 'react';
import { ChatContext } from '../context/ChatContext';
import type { Message } from '../components/chat-ui/types';

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const updateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, data: msg.data + content } : msg
      )
    );
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, updateMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
