import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class InitAdminService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: this.configService.get('ROOT_MAIL') },
      });

      if (!user) {
        const email = this.configService.get('ROOT_MAIL');
        const password = this.configService.get('ROOT_PASSWORD');

        const createUserDto: CreateUserDto = {
          email,
          password,
        };

        const newUser = await this.prismaService.user.create({
          data: { ...createUserDto, roles: [Role.ADMIN] },
        });

        console.log('Super Admin Created -> ', newUser);
      }
    } catch (error) {
      console.error('Error creating super admin:', error);
    }
  }
}
