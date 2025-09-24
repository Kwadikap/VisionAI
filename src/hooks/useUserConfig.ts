import type { IdTokenClaims } from '@/shared/types';
import { useMsal } from '@azure/msal-react';

export function useUserConfig() {
  const { accounts } = useMsal();

  const claims = accounts[0]?.idTokenClaims as IdTokenClaims;

  const username = claims?.name;

  return { username };
}
