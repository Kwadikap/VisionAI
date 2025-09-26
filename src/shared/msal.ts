import { PublicClientApplication } from '@azure/msal-browser';
import { b2cConfig, loginRequest } from './authConfig';

export const pca = new PublicClientApplication(b2cConfig);

export async function getToken(): Promise<string> {
  const accountActive = pca.getActiveAccount() ?? pca.getAllAccounts()[0];

  // if no account, trigger interactive login
  const ensureAccount = async () => {
    if (!accountActive) {
      await pca.loginPopup(loginRequest);
    }
    return pca.getActiveAccount() ?? pca.getAllAccounts()[0];
  };

  const account = await ensureAccount();

  try {
    const res = await pca.acquireTokenSilent({ ...loginRequest, account });
    return res.accessToken;
  } catch {
    const res = await pca.acquireTokenPopup(loginRequest);
    return res.accessToken;
  }
}

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

export function isAuthenticated(): boolean {
  return !!(pca.getActiveAccount() ?? pca.getAllAccounts()[0]);
}
