import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from './logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private logger: LoggingService) {
    this.logger.setContext('Http');
  }

  async use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl, params, body } = request;

    response.on('finish', async () => {
      const { statusCode, statusMessage } = response;
      await this.logger.log(
        `${method} ${originalUrl} Status: ${statusCode} ${statusMessage}`,
      );
      if (Object.keys(params).length > 0) {
        await this.logger.verbose(`Request params: ${JSON.stringify(params)}`);
      }
      if (Object.keys(body).length > 0) {
        await this.logger.verbose(`Request body: ${JSON.stringify(body)}`);
      }
    });

    next();
  }
}
