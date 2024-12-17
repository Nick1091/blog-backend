import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InitAdminService } from './init-admin.service';

@Module({
  imports: [],
  providers: [PrismaService, InitAdminService],
})
export class InitAdminModule {}
