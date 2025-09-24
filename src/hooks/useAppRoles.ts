import type { IdTokenClaims } from '@/shared/types';
import { useMsal } from '@azure/msal-react';

export enum AppRole {
  Admin = 'admin',
  Pro = 'pro',
  Basic = 'basic',
}

export function useAppRoles() {
  const { accounts } = useMsal();

  const roles = (accounts[0]?.idTokenClaims as IdTokenClaims)?.roles;
  const isBasicUser = roles.includes(AppRole.Basic);
  const isProUser = roles.includes(AppRole.Pro);
  const isAdmin = roles.includes(AppRole.Admin);

  return { isAdmin, isBasicUser, isProUser };
}
