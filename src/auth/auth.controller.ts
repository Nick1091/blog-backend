import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Res,
  UnauthorizedException,
  Req,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import {
  Cookies,
  CurrentUser,
  ERRORS_MSGS,
  Public,
  UserAgent,
} from 'src/common';
import { setRefreshTokenToCookie } from './auth.utils';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { REFRESH_TOKEN } from './auth.constants';
import { UserEntity } from 'src/users/entities';
import { JWTPayload } from './auth.interface';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);

    if (!user) {
      throw new BadRequestException(ERRORS_MSGS.WRONG_CREDENTIALS);
    }
    return new UserEntity(user);
  }

  @Post('signin')
  async signin(
    @Body() body: LoginDto,
    @Res() res: Response,
    @UserAgent() agent: string,
    @CurrentUser() user: JWTPayload,
  ) {
    const tokens = await this.authService.login(body, agent, user);

    if (!tokens) throw new BadRequestException(ERRORS_MSGS.WRONG_CREDENTIALS);
    setRefreshTokenToCookie(tokens, res, this.configService);
  }

  @Get('logout')
  async logout(
    @Res() res: Response,
    @Cookies(REFRESH_TOKEN) refreshToken: string,
  ) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);

      return;
    }

    await this.authService.logout(refreshToken);

    res.cookie(REFRESH_TOKEN, '', {
      httpOnly: true,
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK).json({ message: 'Logout successful' });
  }

  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    const refreshToken = req.cookies[REFRESH_TOKEN];

    if (!refreshToken) throw new UnauthorizedException();

    const tokens = await this.authService.refreshTokens(refreshToken, agent);

    if (!tokens) throw new UnauthorizedException();

    setRefreshTokenToCookie(tokens, res, this.configService);
  }
}
