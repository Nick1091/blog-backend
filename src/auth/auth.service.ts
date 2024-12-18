import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ERRORS_MSGS } from 'src/common';

import ms from 'ms';
import { JWTPayload, Tokens } from './auth.interface';
import { v4 } from 'uuid';
import { JWT_CONSTANTS } from './config/constants';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async refreshTokens(
    refreshToken: string,
    userAgent: string,
  ): Promise<Tokens> {
    const token = await this.prismaService.token.findFirst({
      where: { token: refreshToken },
    });

    if (token) {
      await this.prismaService.token.delete({
        where: { token: refreshToken },
      });
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    if (new Date(token?.exp) < new Date()) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({ uid: token.userUid }, true);

    return await this.getTokens(user, userAgent);
  }

  async register({ passwordRepeat, ...dto }: RegisterDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      throw new ConflictException(ERRORS_MSGS.USER.USER_ALREADY_EXISTS);
    }

    return await this.userService.createUser(dto).catch((err) => {
      this.logger.error(err);
    });
  }

  async login(dto: LoginDto, userAgent: string): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    await this.cacheManager.set(
      user.uid,
      user,
      ms(JWT_CONSTANTS.access_expiry),
    );

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new BadRequestException(ERRORS_MSGS.NOT_AUTHORIZED);
    }

    return await this.getTokens(user, userAgent);
  }

  async logout(refreshToken: string) {
    const token = await this.prismaService.token.delete({
      where: { token: refreshToken },
    });

    return token;
  }

  private async getTokens(
    user: { uid: string; email: string; roles: string[] },
    userAgent: string,
  ) {
    const payload = { email: user.email, sub: user.uid, roles: user.roles };

    const { accessToken } = await this.getAccessToken(payload);

    const refreshToken = await this.createUpdateRefreshToken(
      user.uid,
      userAgent,
    );

    return { accessToken, refreshToken };
  }

  private async getAccessToken(payload: JWTPayload) {
    return {
      accessToken:
        'Bearer ' +
        this.jwtService.sign(payload, {
          expiresIn: JWT_CONSTANTS.access_expiry,
          secret: JWT_CONSTANTS.access_secret,
        }),
    };
  }

  private async createUpdateRefreshToken(userUid: string, userAgent: string) {
    const _token = await this.prismaService.token.findFirst({
      where: { userUid, userAgent },
    });

    const token = _token?.token ?? '';

    const expireInMilliseconds = ms(JWT_CONSTANTS.refresh_expiry);
    const exp = new Date(Date.now() + expireInMilliseconds);

    return await this.prismaService.token.upsert({
      where: { token: token, userAgent },
      update: {
        token: v4(),
        exp,
      },
      create: {
        userUid,
        exp,
        userAgent,
      },
    });
  }
}
