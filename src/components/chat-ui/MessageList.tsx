import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from './Message';
import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/useState';

export function MessageList() {
  const messages = useAppSelector((state) => state.chat.messages);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <div className="h-full">
      <ScrollArea className="h-full pr-4">
        {messages.map((m) => (
          <div key={m.id} className="m-2 my-4">
            <Message message={m.data} isUser={m.isUser} />
          </div>
        ))}
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
}
