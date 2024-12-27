import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './users.service';
import { User as UserModel } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserEntity } from './entities';
import { CurrentUser, Public } from 'src/common';
import { JWTPayload } from 'src/auth/auth.interface';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOne(@Body() userData: CreateUserDto): Promise<UserModel> {
    const user = await this.userService.createOne(userData);
    return new UserEntity(user);
  }

  @Public()
  @Get()
  async findAll(): Promise<UserModel[]> {
    const users = await this.userService.findAll({});
    return users.map((user) => new UserEntity(user));
  }

  @Get(':uid')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
  ): Promise<UserModel> {
    const user = await this.userService.findOne({ uid });
    return new UserEntity(user);
  }

  @Get('current')
  @HttpCode(HttpStatus.OK)
  async findCurrent(@CurrentUser() jwtUser: JWTPayload): Promise<UserModel> {
    const uid = jwtUser.sub;
    const user = await this.userService.findOne({ uid });
    return new UserEntity(user);
  }

  @Public()
  @Put(':uid')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() jwtUser: JWTPayload,
  ) {
    const user = await this.userService.updateOne(
      {
        uid,
        data: updateUserDto,
      },
      jwtUser,
    );
    return new UserEntity(user);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @CurrentUser() user: JWTPayload,
  ) {
    await this.userService.deleteOne(
      {
        uid,
      },
      user,
    );
  }
}
