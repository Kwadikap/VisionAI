import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageType } from '@/components/chat-ui/types';
import { visionApi } from '@/shared/api';
import { addMessage, updateMessage } from '@/components/chat-ui/chatSlice';
import { useAppDispatch } from './useState';
import { toast } from 'sonner';

interface SSEventsProps {
  startConnection: boolean;
  baseUrl?: string; // default http://localhost:8000
}

const STREAM_ERROR_ID = 'stream-error';
const SEND_ERROR_ID = 'send-error';

export function useLiveConnection({
  startConnection,
  baseUrl = 'http://localhost:8000',
}: SSEventsProps) {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const connectionOpen = useRef<boolean>(false);
  const connecting = useRef<boolean>(false);
  const reconnecting = useRef<boolean>(false);
  const currentMessageId = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    if (connectionOpen.current) {
      connectionOpen.current = false;
      setIsConnected(false); // ADD
    }
    connecting.current = false;
  }, []);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current || connecting.current || connectionOpen.current)
      return;

    connecting.current = true;

    // EventSource will send the httpOnly cookie automatically (same-site)
    const es = new EventSource(
      `${baseUrl}/stream`,
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
          dispatch(
            addMessage({
              id: currentMessageId.current,
              isUser: false,
              data: '',
              type: MessageType.text,
            })
          );
        }

        // Add message text to the existing message element
        dispatch(
          updateMessage({
            id: currentMessageId.current,
            content: incoming_message.data,
            replace: false,
          })
        );
      }
    };

    // Handle connection close
    es.onerror = function () {
      toast.error('Stream connection lost', { id: STREAM_ERROR_ID });
      cleanup();
    };
  }, [baseUrl, cleanup, dispatch]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!connectionOpen.current) return;

      dispatch(
        addMessage({
          id: crypto.randomUUID(),
          isUser: true,
          data: message,
          type: MessageType.text,
        })
      );

      try {
        const res = await visionApi.post(
          `${baseUrl}/send`,
          { mime_type: 'text/plain', data: message },
          { validateStatus: () => true }
        );

        if (res.status !== 200) {
          const errMsg =
            'Error: ' +
              (res.data &&
                (res.data.error || res.data.message || res.data.detail)) ||
            `Send failed (${res.status})`;
          toast.error(errMsg, { id: SEND_ERROR_ID });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        const errMsg =
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.response?.detail ||
          e?.message ||
          'Network error sending message';
        toast.error(errMsg, { id: SEND_ERROR_ID });
      }
    },
    [baseUrl, dispatch]
  );

  useEffect(() => {
    if (!startConnection) return;
    connectSSE();
  }, [startConnection, connectSSE]);

  return {
    sendMessage,
    connectionOpen,
    isConnected,
  };
}
