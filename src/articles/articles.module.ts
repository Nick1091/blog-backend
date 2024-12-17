import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [ArticlesService, PrismaService, ConfigService],
  controllers: [ArticlesController],
})
export class ArticlesModule {}
