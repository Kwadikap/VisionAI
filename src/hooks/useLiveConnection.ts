import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageType } from '@/components/chat-ui/types';
import { useChatContext } from '@/context/ChatContext';
import { visionApi } from '@/shared/api';

interface SSEventsProps {
  startConnection: boolean;
  baseUrl?: string; // default http://localhost:8000
}

export function useLiveConnection({
  startConnection,
  baseUrl = 'http://localhost:8000',
}: SSEventsProps) {
  const { addMessage, updateMessage } = useChatContext();
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
      cleanup();
    };
  }, [baseUrl, addMessage, updateMessage, cleanup]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!connectionOpen.current) return;

      addMessage({
        id: crypto.randomUUID(),
        isUser: true,
        data: message,
        type: MessageType.text,
      });

      const res = await visionApi.post(
        `${baseUrl}/send`,
        JSON.stringify({ mime_type: 'text/plain', data: message })
      );

      if (res.status !== 200) {
        console.error('Failed to send message', res.data);
        addMessage({
          id: crypto.randomUUID(),
          isUser: true,
          data: res.data,
          type: MessageType.text,
        });
      }
    },
    [baseUrl, addMessage]
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
