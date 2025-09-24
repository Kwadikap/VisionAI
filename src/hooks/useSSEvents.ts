import { MessageType } from '@/components/chat-ui/types';
import { useChatContext } from '@/context/ChatContext';
import { useCallback, useEffect, useRef } from 'react';

interface SSEventsProps {
  sessionId: string;
  startConnection: boolean;
}

export function useSSEvents({ sessionId, startConnection }: SSEventsProps) {
  // const isAudio = useRef<boolean>(false);
  const connectionOpen = useRef<boolean>(false);
  const currentMessageId = useRef<string>(null);

  const baseUrl = 'http://localhost:8000';
  const sseUrl = baseUrl + '/events/' + sessionId;
  const messageUrl = baseUrl + '/send/' + sessionId;

  const eventSourceRef = useRef<EventSource>(null);
  const retryCount = useRef(5);
  const reconnecting = useRef(false);

  const { addMessage, updateMessage } = useChatContext();

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    connectionOpen.current = false;
  };

  const connectSSE = useCallback(() => {
    if (connectionOpen.current || reconnecting.current) return;
    if (retryCount.current <= 0) return;

    // Connect to the SSE endpoint
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.onopen = () => {
      // Connection opened messages
      connectionOpen.current = true;
      reconnecting.current = false;
      console.log('SSE connection opened');
    };

    // Handle incoming messages
    eventSource.onmessage = (event) => {
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
          currentMessageId.current = Math.random().toString(36).substring(7);
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
    eventSource.onerror = function () {
      // Prevent multiple concurrent error handlers racing
      if (reconnecting.current) return;
      reconnecting.current = true;

      cleanup();

      if (retryCount.current > 0) {
        retryCount.current -= 1;
      }
      if (retryCount.current <= 0) {
        // Final failure - stop trying
        return;
      }
      setTimeout(() => {
        console.log('Reconnecting...');
        reconnecting.current = false;
        connectSSE();
      }, 5000);
    };
  }, [sseUrl, addMessage, updateMessage]);

  useEffect(() => {
    if (!startConnection) return;
    // Reset retries on new session
    retryCount.current = 5;
    connectSSE();
    return () => cleanup();
  }, [sessionId, connectSSE, startConnection]);

  async function sendMessage(message: string) {
    try {
      const response = await fetch(messageUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mime_type: MessageType.text,
          data: message,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send message: ', response.statusText);
      }

      addMessage({
        id: currentMessageId.current || '',
        isUser: true,
        data: message,
        type: MessageType.text,
      });
    } catch (error) {
      console.log('Error sending message:', error);
    }
  }

  return {
    sendMessage,
    connectionOpen,
  };
}
