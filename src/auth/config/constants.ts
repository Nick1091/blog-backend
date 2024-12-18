export const JWT_CONSTANTS = {
  access_secret: process.env.JWT_SECRET_KEY || 'jwt-secret',
  access_expiry: process.env.JWT_EXPIRE_TIME || '1h',

  refresh_secret: process.env.JWT_SECRET_REFRESH_KEY || 'jwt-refresh-secret',
  refresh_expiry: process.env.JWT_REFRESH_EXPIRE_TIME || '24h',
};
