import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext } from '@/context/ChatContext';
import { Message } from './Message';
import { useEffect, useRef } from 'react';

export function MessageList() {
  const { messages } = useChatContext();
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
