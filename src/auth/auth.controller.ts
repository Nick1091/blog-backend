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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Cookies, ERRORS_MSGS, Public, UserAgent } from 'src/common';
import { setRefreshTokenToCookie } from './auth.utils';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { REFRESH_TOKEN } from './auth.constants';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);

    if (!user) {
      throw new BadRequestException(ERRORS_MSGS.WRONG_CREDENTIALS);
    }
    return user;
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res() res: Response,
    @UserAgent() agent: string,
  ) {
    const tokens = await this.authService.login(body, agent);

    if (!tokens) throw new BadRequestException(ERRORS_MSGS.WRONG_CREDENTIALS);
    setRefreshTokenToCookie(tokens, res, this.configService);
  }

  @Get('logout')
  async logout(
    @Req() req: Request,
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
      secure: true,
      expires: new Date(),
    });
    res.sendStatus(HttpStatus.OK);
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
