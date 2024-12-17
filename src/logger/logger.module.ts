import { Logger, Module } from '@nestjs/common';
import { LoggingService } from './logger.service';

@Module({
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
