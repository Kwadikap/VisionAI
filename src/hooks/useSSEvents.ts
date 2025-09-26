import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageType } from '@/components/chat-ui/types';
import { useChatContext } from '@/context/ChatContext';
import { visionApiPublic, optionalAuthHeaders } from '@/shared/api';

interface SSEventsProps {
  startConnection: boolean;
  baseUrl?: string; // default http://localhost:8000
}

type InitResponse = {
  session_id: string;
  tier: 'basic' | 'pro' | 'advanced';
  is_guest: boolean;
};

export function useSSEvents({
  startConnection,
  baseUrl = 'http://localhost:8000',
}: SSEventsProps) {
  const { addMessage, updateMessage } = useChatContext();

  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem('vision_session_id')
  );
  const [tier, setTier] = useState<'basic' | 'pro' | 'advanced' | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(true);

  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const connectionOpen = useRef<boolean>(false);
  const connecting = useRef<boolean>(false);
  const retryCount = useRef<number>(5);
  const reconnecting = useRef<boolean>(false);
  const currentMessageId = useRef<string | null>(null);
  const initInFlight = useRef<Promise<InitResponse> | null>(null);

  const cleanup = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (connectionOpen.current) {
      connectionOpen.current = false;
      setIsConnected(false); // ADD
    }
    connecting.current = false;
  }, []);

  const initSession = useCallback(
    async (reuse?: string): Promise<InitResponse> => {
      if (initInFlight.current) return initInFlight.current;
      initInFlight.current = (async () => {
        const headers = {
          'Content-Type': 'application/json',
          ...(await optionalAuthHeaders()),
        };
        const body = reuse ? { session_id: reuse } : {};
        const res = await visionApiPublic.post<InitResponse>(
          '/session/init',
          body,
          { headers, withCredentials: true }
        );
        return res.data;
      })();
      try {
        return await initInFlight.current;
      } finally {
        initInFlight.current = null;
      }
    },
    []
  );

  // 2) open SSE
  const connectSSE = useCallback(() => {
    if (!sessionId) return;
    if (eventSourceRef.current || connecting.current || connectionOpen.current)
      return;
    if (retryCount.current <= 0) return;

    connecting.current = true;

    // EventSource will send the httpOnly cookie automatically (same-site)
    const es = new EventSource(
      `${baseUrl}/events/${encodeURIComponent(sessionId)}`,
      { withCredentials: true } // (optional; some browsers ignore)
    );
    eventSourceRef.current = es;

    es.onopen = () => {
      connectionOpen.current = true;
      setIsConnected(true);
      reconnecting.current = false;
      connecting.current = false;
    };
    // Handle incoming messages
    es.onmessage = (event) => {
      // Parse incoming message
      const incoming_message = JSON.parse(event.data);
      console.log('[AGENT TO CLIENT] ', incoming_message);

      // Check if the turn is complete
      // If complete, add new message
      if (
        incoming_message.turn_complete &&
        incoming_message.turn_complete == true
      ) {
        currentMessageId.current = null;
        return;
      }

      // If its text, print it
      if (incoming_message.mime_type == 'text/plain') {
        // add a new message for new turn
        if (currentMessageId.current == null) {
          currentMessageId.current = crypto.randomUUID();
          addMessage({
            id: currentMessageId.current,
            isUser: false,
            data: '',
            type: MessageType.text,
          });
        }

        // Add message text to the existing message element
        updateMessage(currentMessageId.current, incoming_message.data);
      }
    };

    // Handle connection close
    es.onerror = function () {
      if (reconnecting.current) return;
      reconnecting.current = true;
      cleanup();
      // First failure after reload may be expired cookie: re-init once
      if (--retryCount.current <= 0) return;
      setTimeout(async () => {
        reconnecting.current = false;
        try {
          await initSession(sessionId);
        } catch {
          // If reuse fails, start fresh
          localStorage.removeItem('vision_session_id');
          const fresh = await initSession();
          localStorage.setItem('vision_session_id', fresh.session_id);
          setSessionId(fresh.session_id);
        }
        connectSSE();
      }, 3000);
    };
  }, [baseUrl, sessionId, addMessage, updateMessage, cleanup, initSession]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!sessionId || !connectionOpen.current) return;

      const res = await fetch(
        `${baseUrl}/sessions/${encodeURIComponent(sessionId)}/messages`,
        {
          method: 'POST',
          credentials: 'include', // send cookie
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mime_type: 'text/plain', data: message }),
        }
      );

      if (res.status === 401) {
        try {
          await initSession(sessionId);
          connectSSE();
        } catch (e) {
          console.error('Re-init after 401 failed', e);
        }
        return;
      }

      addMessage({
        id: crypto.randomUUID(),
        isUser: true,
        data: message,
        type: MessageType.text,
      });
    },
    [baseUrl, sessionId, addMessage, connectSSE, initSession]
  );

  useEffect(() => {
    if (!startConnection) {
      cleanup();
      return;
    }
    let cancelled = false;
    (async () => {
      retryCount.current = 5;
      // Refresh or create session (always refresh cookie each load)
      try {
        const init = await initSession(sessionId || undefined);
        if (cancelled) return;
        if (!sessionId || sessionId !== init.session_id) {
          setSessionId(init.session_id);
          localStorage.setItem('vision_session_id', init.session_id);
        }
        setTier(init.tier);
        setIsGuest(init.is_guest);
      } catch (e) {
        console.error('session/init failed', e);
        return;
      }
      if (!cancelled) connectSSE();
    })();
    return () => {
      cancelled = true;
    };
  }, [startConnection, sessionId, initSession, connectSSE, cleanup]);

  const clearSession = useCallback(() => {
    cleanup();
    localStorage.removeItem('vision_session_id');
    setSessionId(null);
    setTier(null);
    setIsGuest(true);
  }, [cleanup]);

  return {
    sendMessage,
    connectionOpen,
    isConnected,
    sessionId,
    tier,
    isGuest,
    clearSession,
  };
}
