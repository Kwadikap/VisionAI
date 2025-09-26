import { visionApi, visionApiPublic } from '@/shared/api';
import { useMutation } from '@tanstack/react-query';
import { loadSessionId, saveSessionId } from '@/shared/session';
import { useCallback } from 'react';

interface StartSessionResponse {
  session_id: string;
}

export function useSessions() {
  const startSession = useMutation({
    mutationFn: async (): Promise<StartSessionResponse> => {
      const { data } =
        await visionApiPublic.post<StartSessionResponse>('/session/start');
      return data;
    },
  });

  //call this after login to attach identity to the existing session
  const attachSession = useMutation({
    // Authorization header comes from visionApi interceptor (getToken)
    mutationFn: async ({ session_id }: { session_id: string }) => {
      await visionApi.post('/session/attach', { session_id: session_id });
      return true;
    },
  });

  // Returns a valid sid from storage or creates a new one
  const getOrCreateSessionId = useCallback(async (): Promise<string> => {
    // Prefer existing stored sid
    const existing = loadSessionId();
    if (existing) return existing;

    const { session_id } = await startSession.mutateAsync();
    saveSessionId(session_id);
    return session_id;
  }, [startSession]);

  return { startSession, attachSession, getOrCreateSessionId };
}
