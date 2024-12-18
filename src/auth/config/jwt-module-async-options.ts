import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';
import { JWT_CONSTANTS } from './constants';

const jwtModuleOptions = (): JwtModuleOptions => ({
  secret: JWT_CONSTANTS.access_secret,
  signOptions: { expiresIn: JWT_CONSTANTS.access_expiry },
});

export const options = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: () => jwtModuleOptions(),
});
