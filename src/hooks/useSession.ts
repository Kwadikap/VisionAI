import type { Message } from '@/components/chat-ui/types';
import { visionApi } from '@/shared/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { toast } from 'sonner';

interface ChatHistory {
  session_id: string;
  messages: Message[];
}

interface ChatHistoryResponse {
  sessions: ChatHistory[];
}

interface InitSessionResponse {
  message: string;
  // add other fields if backend returns them
}

export function useSession() {
  const sessionCreated = useRef<boolean>(false);
  const createSession = useMutation<InitSessionResponse, Error>({
    mutationFn: async () => {
      const res = await visionApi.post('/session/init');
      return res.data as InitSessionResponse;
    },
    onSuccess: () => {
      sessionCreated.current = true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message || e.message || 'Failed to init session';
      toast.error('Session init failed', { description: msg });
    },
  });

  const chatHistoryQuery = useQuery<ChatHistoryResponse, Error>({
    queryKey: ['chat-history'],
    enabled: sessionCreated.current === true,
    queryFn: async () => {
      try {
        const res = await visionApi.get('/chat-history');
        return res.data as ChatHistoryResponse;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e.message ||
          'Failed to fetch chat history';
        toast.error('Chat history load failed', { description: msg });
        throw e;
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    createSession,
    sessionLoading: createSession.isPending,
    chatHistory: chatHistoryQuery.data,
    chatHistoryLoading: chatHistoryQuery.isLoading,
    error: chatHistoryQuery.error,
    refetchHistory: chatHistoryQuery.refetch,
  };
}
