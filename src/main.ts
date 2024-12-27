import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingService } from './logger';
import { HttpExceptionFilter } from './exceptions';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 5432;
const host =
  process.env.NODE_ENV === 'production' ? process.env.HOST : 'localhost';
const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const logger = app.get(LoggingService);
  app.useLogger(logger);
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8081'
        : process.env.CORS_URL_PROD,
    credentials: true,
  });

  process.on('unhandledRejection', async (error, origin) => {
    await logger.error(`unhandledRejection: ${error}, origin: ${origin}`);
  });

  process.on('uncaughtException', async (error, origin) => {
    await logger.error(`uncaughtException: ${error}, origin: ${origin}`);
  });

  app.useGlobalFilters(new HttpExceptionFilter(logger));

  await app.listen(PORT, () => console.log(`🚀 Server listen port ${PORT}`));

  console.log(`🚀 Server is running on ${protocol}://${host}:${PORT}`);
}

bootstrap();
