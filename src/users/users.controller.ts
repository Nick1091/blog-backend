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
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userData: CreateUserDto): Promise<UserModel> {
    const user = await this.userService.createUser(userData);
    return new UserEntity(user);
  }

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

  @Put(':uid')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update({
      uid,
      data: updateUserDto,
    });
    return new UserEntity(user);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('uid', new ParseUUIDPipe({ version: '4' })) uid: string) {
    await this.userService.delete({
      uid,
    });
  }
}
