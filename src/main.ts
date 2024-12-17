import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingService } from './logger';
import { HttpExceptionFilter } from './exceptions';
import cookieParser from 'cookie-parser';

const PORT = process.env.PORT || 5432;

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

  process.on('unhandledRejection', async (error, origin) => {
    await logger.error(`unhandledRejection: ${error}, origin: ${origin}`);
  });

  process.on('uncaughtException', async (error, origin) => {
    await logger.error(`uncaughtException: ${error}, origin: ${origin}`);
  });

  app.useGlobalFilters(new HttpExceptionFilter(logger));

  await app.listen(PORT, () => console.log(`🚀 Server listen port${PORT}`));
}

bootstrap();
