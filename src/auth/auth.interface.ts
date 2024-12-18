import { Token } from '@prisma/client';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

export interface JWTPayload {
  email: string;
  sub: string;
  roles: string[];
}
