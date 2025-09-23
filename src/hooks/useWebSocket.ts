/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef, useState } from 'react';
import { MessageType, type Message } from '@/components/chat-ui/types';
import { base64ToArray } from '@/lib/utils';
import { useAudio } from './useAudio';

interface WebSocketProps {
  sessionId: string;
  addMessage: (msg: Message) => void;
}

export function useWebSocket({ sessionId, addMessage }: WebSocketProps) {
  const [is_audio, setIsAudio] = useState<boolean>(false);
  const [socketOpen, setSocketOpen] = useState<boolean>(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

  const isAudioRef = useRef<boolean>(false);
  const messageRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);

  // Create stable sendMessage first
  const sendMessage = useCallback(
    (message: { type: MessageType; data: any }) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        const messageJson = JSON.stringify({
          mime_type: message.type,
          data: message.data,
        });
        ws.send(messageJson);
      }
    },
    []
  );

  // Now useAudio can safely use sendMessage
  const { audioPlayerNode, startAudio } = useAudio({
    sendMessage,
  });

  const url = useCallback(() => {
    const wsPath = `/ws/${sessionId}?is_audio=${isAudioRef.current}`;
    const explicit = import.meta.env.VITE_WS_ORIGIN as string | undefined;
    if (explicit) {
      const base = explicit.replace(/^http(s?):\/\//, 'ws$1://');
      return `${base}${wsPath}`;
    }
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${proto}://${window.location.host}${wsPath}`;
  }, [sessionId]);

  const connectWebsocket = useCallback(() => {
    const existing = wsRef.current;
    if (
      existing &&
      (existing.readyState === WebSocket.OPEN ||
        existing.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    console.log(`Connecting WebSocket with is_audio=${isAudioRef.current}`);
    shouldReconnectRef.current = true;
    const ws = new WebSocket(url());
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      setSocketOpen(true);
      console.log('WebSocket connected successfully');
    };

    ws.onmessage = (event: MessageEvent) => {
      // If the server ever sends bytes (e.g., audio in future), don't blow up
      if (typeof event.data !== 'string') {
        // You can handle raw ArrayBuffer here if you start using binary frames server->client
        // For now, just ignore or log:
        // const bytes = event.data as ArrayBuffer;
        // console.debug("binary frame from server", bytes.byteLength);
        return;
      }

      let incoming: any;
      try {
        incoming = JSON.parse(event.data);
      } catch {
        console.warn(
          'Non-JSON text frame from server (ignored). Head:',
          String(event.data).slice(0, 120)
        );
        return;
      }

      // turn_complete frames may be boolean true or "true"
      if (incoming.turn_complete && incoming.turn_complete == true) {
        if (messageRef.current.length > 0) {
          addMessage({
            id: currentMessageId || crypto.randomUUID(),
            isUser: false,
            data: messageRef.current,
            type: MessageType.text,
          });
        }
        setCurrentMessageId(null);
        messageRef.current = '';
        return;
      }

      if (incoming.interrupted && incoming.interrupted == true) {
        // Stop audio playback if it's playing
        if (audioPlayerNode) {
          audioPlayerNode.current.port.postMessage({ command: 'endOfAudio' });
        }
        return;
      }

      // AUDIO: support both data_b64 and data for backward compatibility
      if (incoming.mime_type === MessageType.audio) {
        const b64 = incoming.data_b64 ?? incoming.data;
        if (b64) {
          audioPlayerNode.current.port.postMessage(base64ToArray(b64));
        } else {
          console.warn('audio message without base64 payload');
        }
        return;
      }

      if (incoming.mime_type === MessageType.text) {
        messageRef.current = incoming.data;
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed', event.code, event.reason);
      setSocketOpen(false);
      wsRef.current = null;

      if (shouldReconnectRef.current && event.code !== 1000) {
        setTimeout(() => connectWebsocket(), 2000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error', error);
      setSocketOpen(false);
    };
  }, [url, addMessage, audioPlayerNode, currentMessageId]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    const ws = wsRef.current;
    if (ws) {
      try {
        ws.close(1000, 'User disconnected');
      } finally {
        wsRef.current = null;
      }
    }
    if (audioPlayerNode) {
      audioPlayerNode.current.port.postMessage({ command: 'endOfAudio' });
    }
    setSocketOpen(false);
    setCurrentMessageId(null);
  }, [audioPlayerNode]);

  // Manual reconnect function instead of useEffect
  const reconnectWithNewMode = useCallback(
    async (newIsAudio: boolean) => {
      if (wsRef.current) {
        disconnect();
      }
      isAudioRef.current = newIsAudio;
      setIsAudio(newIsAudio); // async, used for UI only
      if (newIsAudio) {
        await startAudio();
      }
      setTimeout(() => connectWebsocket(), 100);
    },
    [disconnect, connectWebsocket, startAudio]
  );

  return {
    connectWebsocket,
    disconnect,
    sendMessage,
    socketOpen,
    is_audio,
    setIsAudio,
    reconnectWithNewMode,
    startAudio,
  };
}
