import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { InitAdminModule } from './init-admin/init-admin.module';
import { UserModule } from './users/users.module';
import { HttpLoggerMiddleware, LoggingModule } from './logger';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    InitAdminModule,
    AuthModule,
    UserModule,
    ArticlesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 60,
      max: 20,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
