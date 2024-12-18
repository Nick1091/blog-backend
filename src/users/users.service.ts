import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import { ERRORS_MSGS } from 'src/common/constants';
import { comparePassword, setHashPassword } from 'src/common/utils';
import { UpdateUserDto } from './dto/update-user.dto';
import { JWTPayload } from 'src/auth/auth.interface';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import ms from 'ms';
import { JWT_CONSTANTS } from 'src/auth/config';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await setHashPassword(data.password);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    isReset = false,
  ): Promise<User | null> {
    if (isReset) {
      await this.cacheManager.del(
        userWhereUniqueInput.uid || userWhereUniqueInput.email,
      );
    }
    const user = await this.cacheManager.get<User>(
      userWhereUniqueInput.uid || userWhereUniqueInput.email,
    );

    if (!user) {
      const user = await this.prisma.user.findUnique({
        where: userWhereUniqueInput,
      });

      if (!user) {
        throw new NotFoundException(ERRORS_MSGS.USER.USER_NOT_FOUND);
      }

      await this.cacheManager.set(
        userWhereUniqueInput.uid || userWhereUniqueInput.email,
        user,
        ms(JWT_CONSTANTS.refresh_expiry),
      );

      return user;
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

  async update(
    params: {
      uid: string;
      data: UpdateUserDto;
    },
    jwtUser: JWTPayload,
  ): Promise<User> {
    const { uid, data } = params;
    if (jwtUser.sub !== uid && !jwtUser.roles.includes(Role.ADMIN)) {
      throw new ForbiddenException();
    }

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
    jwtUser: JWTPayload,
  ): Promise<User> {
    if (
      jwtUser.sub !== userWhereUniqueInput.uid &&
      !jwtUser.roles.includes(Role.ADMIN)
    ) {
      throw new ForbiddenException();
    }
    const cashUser = await this.cacheManager.get<User>(
      userWhereUniqueInput.uid || userWhereUniqueInput.email,
    );

    if (cashUser) {
      await this.cacheManager.del(
        userWhereUniqueInput.uid || userWhereUniqueInput.email,
      );
    }

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
