import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JWTPayload } from 'src/auth/auth.interface';

export const CurrentUser = createParamDecorator(
  (
    key: keyof JWTPayload,
    ctx: ExecutionContext,
  ): JWTPayload | Partial<JWTPayload> => {
    const request = ctx.switchToHttp().getRequest();
    return key ? request.user[key] : request.user;
  },
);
