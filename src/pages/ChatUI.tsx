import { loadMessages } from '@/components/chat-ui/chatSlice';
import { MessageInputForm } from '@/components/chat-ui/MessageInputForm';
import { MessageList } from '@/components/chat-ui/MessageList';
import { useLiveConnection } from '@/hooks/useLiveConnection';
import { useSession } from '@/hooks/useSession';
import { useAppDispatch } from '@/hooks/useState';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function ChatUI() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const dispatch = useAppDispatch();
  const [startConnection, setStartConnection] = useState(false);
  const initCalled = useRef(false);
  const resumedFor = useRef<string | null>(null); // guard per-session resume
  const { createSession, resumeSession } = useSession();

  // If no sessionId in URL, create a new session once
  useEffect(() => {
    if (sessionId) return; // resume path handles this
    if (initCalled.current) return;
    initCalled.current = true;
    (async () => {
      try {
        await createSession.mutateAsync();
        if (!startConnection) setStartConnection(true);
      } catch (e) {
        console.error('Session init failed', e);
      }
    })();
  }, [sessionId, createSession, startConnection]);

  // If sessionId present, resume that session and load messages
  useEffect(() => {
    if (!sessionId) return;
    if (resumedFor.current === sessionId) return; // prevent loops/duplicates
    resumedFor.current = sessionId;

    resumeSession.mutate(
      { sessionId, startStream: false, updateToken: true },
      {
        onSuccess: (data) => {
          const sess =
            data.sessions?.find((s) => s.session_id === sessionId) ??
            data.sessions?.[0];
          if (sess) {
            dispatch(loadMessages(sess.messages));
            setStartConnection(true);
          } else {
            toast.error('Session not found');
          }
        },
        onError: () => {
          // allow retry if navigation changes
          resumedFor.current = null;
        },
      }
    );
  }, [sessionId]);

  const { sendMessage, isConnected } = useLiveConnection({
    startConnection,
    baseUrl: 'http://localhost:8000',
    reconnectKey: sessionId || 'root', // force reconnect when switching sessions
  });

  useEffect(() => {
    if (isConnected) toast.success('Connected to agent');
  }, [isConnected]);

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
