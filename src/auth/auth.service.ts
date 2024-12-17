import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/users/users.service';
import { LoginDto, RegisterDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ERRORS_MSGS, JWT_CONSTANTS } from 'src/common';

import ms from 'ms';
import { Tokens } from './auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    const token = await this.prismaService.token.findUnique({
      where: { token: refreshToken },
    });

    await this.prismaService.token.delete({
      where: { token: refreshToken },
    });

    if (new Date(token.exp) < new Date()) {
      throw new UnauthorizedException();
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({ uid: token.userUid });

    return await this.getTokens(user);
  }

  async register({ passwordRepeat, ...dto }: RegisterDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      throw new ConflictException(ERRORS_MSGS.USER.USER_ALREADY_EXISTS);
    }

    return await this.userService.createUser(dto).catch((err) => {
      console.log(dto);
      this.logger.error(err);
    });
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new BadRequestException(ERRORS_MSGS.NOT_AUTHORIZED);
    }

    return await this.getTokens(user);
  }

  private async getTokens(user: { uid: string; email: string }) {
    const payload = { email: user.email, sub: user.uid };

    const { accessToken } = await this.getAccessToken(payload);

    const refreshToken = await this.createUpdateRefreshToken(user.uid);

    return { accessToken, refreshToken };
  }

  private async getAccessToken(payload: { email: string; sub: string }) {
    return {
      accessToken:
        'Bearer ' +
        this.jwtService.sign(payload, {
          expiresIn: JWT_CONSTANTS.access_expiry,
          secret: JWT_CONSTANTS.access_key,
        }),
    };
  }

  private async createUpdateRefreshToken(userUid: string) {
    const token = await this.prismaService.token.findFirst({
      where: { userUid },
    });

    const expireInMilliseconds = ms(JWT_CONSTANTS.refresh_expiry);
    const exp = new Date(Date.now() + expireInMilliseconds);

    if (token) {
      return await this.prismaService.token.update({
        where: { token: token.token },
        data: {
          userUid,
          exp,
        },
      });
    } else {
      return await this.prismaService.token.create({
        data: {
          userUid,
          exp,
        },
      });
    }
  }
}
