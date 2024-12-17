export const ERRORS_MSGS = {
  BAD_RT: 'Dto is invalid (no refreshToken in body)',
  EXPIRED_RF_TOKEN:
    'Authentication failed (Refresh token is invalid or expired)',
  NOT_AUTHORIZED: 'Incorrect email or password',
  INVALID_UUID: 'Bad request. Validation failed (uuid v4 is expected)',
  USER: {
    USER_NOT_FOUND: 'User not found.',
    USER_ALREADY_EXISTS: 'User already exists',
    PASSWORD_WRONG: 'Old Password is wrong',
  },
  WRONG_CREDENTIALS: 'Wrong credentials',
  BlOG: {
    NOT_FOUND: (id: string) => `There is no blog with id: ${id}`,
  },
};
