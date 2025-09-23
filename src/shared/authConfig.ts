import type { Configuration } from '@azure/msal-browser';

const tenant = import.meta.env.VITE_TENANT;
const domain = `${tenant}.ciamlogin.com`;
const authority = `https://${domain}/${tenant}.onmicrosoft.com`;

export const b2cConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority,
    knownAuthorities: [domain],
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri:
      import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI || window.location.origin,
  },
  cache: { cacheLocation: 'localStorage', storeAuthStateInCookie: false },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'offline_access'], // plus your API scopes if needed
};
