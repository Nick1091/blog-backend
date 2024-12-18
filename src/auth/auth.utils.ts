import { Tokens } from './auth.interface';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { REFRESH_TOKEN } from './auth.constants';

export const setRefreshTokenToCookie = (
  tokens: Tokens,
  res: Response,
  config: ConfigService,
) => {
  if (!tokens) {
    throw new UnauthorizedException();
  }

  const { accessToken, refreshToken } = tokens;

  res.cookie(REFRESH_TOKEN, refreshToken.token, {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(refreshToken.exp),
    secure: config.get('NODE_ENV', 'development') === 'production',
    path: '/',
  });
  res.status(HttpStatus.CREATED).json({ accessToken });
};
