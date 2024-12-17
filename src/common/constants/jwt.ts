export const JWT_CONSTANTS = {
  access_key: process.env.JWT_SECRET_KEY || 'jwt-secret',
  access_expiry: process.env.TOKEN_EXPIRE_TIME || '1h',

  refresh_key: process.env.JWT_SECRET_REFRESH_KEY || 'jwt-refresh-secret',
  refresh_expiry: process.env.TOKEN_REFRESH_EXPIRE_TIME || '24h',
};

export const REFRESH_TOKEN = 'refreshToken';
