export interface IdTokenClaims {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  nonce?: string;
  auth_time?: number;
  amr?: string[];
  acr?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  emails?: string[];
  oid?: string;
  tid?: string;
  uti?: string;
  ver?: string;
  rh?: string;
  roles: string[];
  [key: string]: string | number | string[] | boolean | undefined;
}

export enum Tier {
  BASIC = 'basic',
  PRO = 'pro',
  ADVANCED = 'advanced',
}
