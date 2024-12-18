import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JWTPayload } from '../auth.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWT_CONSTANTS } from '../config/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_CONSTANTS.access_secret,
    });
  }

  async validate(payload: JWTPayload): Promise<JWTPayload> {
    const user = await this.prismaService.user
      .findUnique({
        where: { uid: payload.sub },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });

    if (!user) throw new UnauthorizedException();
    return payload;
  }
}
