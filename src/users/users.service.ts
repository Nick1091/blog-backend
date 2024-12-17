import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { ERRORS_MSGS } from 'src/common/constants';
import { comparePassword, setHashPassword } from 'src/common/utils';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await setHashPassword(data.password);
    console.log(hashedPassword, data);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (!user) {
      throw new NotFoundException(ERRORS_MSGS.USER.USER_NOT_FOUND);
    }
    return user;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    const users = this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });

    if (!users) {
      throw new NotFoundException(ERRORS_MSGS.USER.USER_NOT_FOUND);
    }
    return users;
  }

  async update(params: { uid: string; data: UpdateUserDto }): Promise<User> {
    const { uid, data } = params;

    const userBd = await this.prisma.user.findFirst({ where: { uid } });

    if (!userBd) {
      throw new NotFoundException(ERRORS_MSGS.USER.USER_NOT_FOUND);
    }

    if (!(await comparePassword(data.oldPassword, userBd.password))) {
      throw new ForbiddenException(ERRORS_MSGS.USER.PASSWORD_WRONG);
    }

    const hash = await setHashPassword(data.newPassword);
    const newUser = await this.prisma.user.update({
      where: { uid },
      data: {
        password: hash,
      },
    });

    return newUser;
  }

  async delete(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User> {
    const user = this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (!user) {
      throw new NotFoundException(ERRORS_MSGS.USER.USER_NOT_FOUND);
    }

    return this.prisma.user.delete({
      where: userWhereUniqueInput,
    });
  }
}
