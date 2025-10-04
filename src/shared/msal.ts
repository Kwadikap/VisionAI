import { PublicClientApplication } from '@azure/msal-browser';
import { b2cConfig, loginRequest } from './authConfig';

export const pca = new PublicClientApplication(b2cConfig);

// Silent-only. Returns null if no account or silent fails.
export async function getTokenIfAvailable(): Promise<string | null> {
  const account = pca.getActiveAccount() ?? pca.getAllAccounts()[0];
  if (!account) return null;
  try {
    const res = await pca.acquireTokenSilent({ ...loginRequest, account });
    return res.accessToken || null;
  } catch {
    return null; // stay guest
  }
}

// Silent required. Throws if interaction is needed.
export async function getToken(): Promise<string> {
  const account = pca.getActiveAccount() ?? pca.getAllAccounts()[0];
  if (!account) throw new Error('Interaction required');
  const res = await pca.acquireTokenSilent({ ...loginRequest, account });
  return res.accessToken;
}

// Call this from a user gesture (button click), not from interceptors.
export async function loginInteractive(): Promise<void> {
  const res = await pca.loginPopup({ scopes: loginRequest.scopes });
  pca.setActiveAccount(res.account);
}

export function isAuthenticated(): boolean {
  return !!(pca.getActiveAccount() ?? pca.getAllAccounts()[0]);
}
