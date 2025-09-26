// src/shared/session.ts
const KEY = 'vision.sid';
const TTL_MS = 10 * 60 * 1000; // keep aligned with server SESSION_TTL

export function loadSessionId(): string | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const { sid, exp } = JSON.parse(raw);
    if (!sid || Date.now() > exp) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return sid;
  } catch {
    return null;
  }
}

export function saveSessionId(sessionId: string) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify({ sid: sessionId, exp: Date.now() + TTL_MS })
  );
}

export function clearSessionId() {
  sessionStorage.removeItem(KEY);
}
