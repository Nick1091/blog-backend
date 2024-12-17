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
import { ERRORS_MSGS, REFRESH_TOKEN } from 'src/common';
import { setRefreshTokenToCookie } from './auth.utils';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';

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
    @Req() req: Request,
  ) {
    const agent = req.headers['user-agent'];
    const tokens = await this.authService.login(body);

    if (!tokens) throw new BadRequestException(ERRORS_MSGS.WRONG_CREDENTIALS);
    setRefreshTokenToCookie(tokens, res, this.configService);
  }

  // @Post('logout')
  // async logout(@Body() body: LoginDto, @Res() res: Response) {
  //   const tokens = await this.authService.login(body);

  //   if (!tokens) throw new BadRequestException(ERRORS_MSGS.WRONG_CREDENTIALS);
  //   setRefreshTokenToCookie(tokens, res, this.configService);
  // }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN];
    if (!refreshToken) throw new UnauthorizedException();
    console.log(refreshToken, 'refreshToken');
    const tokens = await this.authService.refreshTokens(refreshToken);
    if (!tokens) throw new UnauthorizedException();
    setRefreshTokenToCookie(tokens, res, this.configService);
  }
}
