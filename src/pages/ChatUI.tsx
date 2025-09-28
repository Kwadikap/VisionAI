import { MessageInputForm } from '@/components/chat-ui/MessageInputForm';
import { MessageList } from '@/components/chat-ui/MessageList';
import { useLiveConnection } from '@/hooks/useLiveConnection';
import { visionApi } from '@/shared/api';
import { useEffect, useRef, useState } from 'react';

export function ChatUI() {
  const [startConnection, setStartConnection] = useState(false);
  const initCalled = useRef(false);

  const initSession = async () => {
    try {
      await visionApi.post('/session/init');
      if (!startConnection) setStartConnection(true);
    } catch (e) {
      console.error('Session init failed', e);
    }
  };

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    initSession();
  }, []);

  const { sendMessage, isConnected } = useLiveConnection({
    startConnection,
    baseUrl: 'http://localhost:8000',
  });

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden px-4 py-4">
      <div className="relative flex min-h-0 w-full max-w-3xl flex-1 flex-col">
        <div className="flex-1 overflow-hidden pb-20">
          <MessageList />
        </div>
        <div className="absolute bottom-3 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="px-4 py-3">
            <MessageInputForm onSubmit={sendMessage} disabled={!isConnected} />
          </div>
        </div>
      </div>
    </div>
  );
}
