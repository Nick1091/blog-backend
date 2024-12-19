export const ERRORS_MSGS = {
  BAD_RT: 'Dto is invalid (no refreshToken in body)',
  EXPIRED_RF_TOKEN:
    'Authentication failed (Refresh token is invalid or expired)',
  NOT_AUTHORIZED: 'Incorrect email or password',
  INVALID_UUID: 'Bad request. Validation failed (uuid v4 is expected)',
  USER: {
    USER_NOT_FOUND: 'User not found.',
    REGISTRATION_FAILED: 'Registration failed.',
    USERS_NOT_FOUND: 'User not found.',
    USER_ALREADY_EXISTS: 'User already exists',
    PASSWORD_WRONG: 'Old Password is wrong',
  },
  WRONG_CREDENTIALS: 'Wrong credentials',
  ARTICLE: {
    NOT_FOUND: (uid: string) => `There is no article with uid: ${uid}`,
    ARTICLES_NOT_FOUND: 'Articles not found.',
    INVALID_USER_ID: 'Invalid userId.',
    ARTICLES_FETCH_ERROR: 'Articles fetch error.',
    ARTICLE_NOT_FOUND: 'Article not found.',
    ARTICLE_NOT_DELETED: 'Article not deleted.',
    ARTICLE_NOT_UPDATE: 'Article not update.',
    ARTICLE_NOT_CREATED: 'Article not created.',
  },
};
