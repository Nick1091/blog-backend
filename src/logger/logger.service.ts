import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as os from 'os';
import { resolve, dirname } from 'path';

enum LoggingLevels {
  LOG,
  ERROR,
  WARN,
  DEBUG,
  VERBOSE,
}

@Injectable()
export class LoggingService extends ConsoleLogger {
  private loggingLevel = parseInt(process.env.LOGGING_LEVEL) || 4;
  private logFileSize = (parseFloat(process.env.LOG_FILE_SIZE) || 10) * 1024;

  private logFileName = 'log';
  private errorFileName = 'error';
  private logFileExtention = 'txt';

  private async logToFile(message: string, level: LoggingLevels) {
    let fileName = this.logFileName;
    if (level === LoggingLevels.ERROR) fileName = this.errorFileName;
    const dir = resolve(__dirname, '..', '..', '..', 'logs');
    let counter = 0;
    let fn: string;
    do {
      counter += 1;
      fn = resolve(dir, `${fileName}${counter}.${this.logFileExtention}`);
      try {
        const stats = await fs.stat(fn);
        if (stats.size < this.logFileSize) {
          break;
        }
      } catch (e) {
        if (e.code === 'ENOENT') break;
      }
    } while (counter < 1000);

    try {
      await fs.mkdir(dirname(fn), { recursive: true });
    } catch (e) {
      console.log(e);
    }

    try {
      const date = new Date();
      const levelString = LoggingLevels[level].padStart(7);
      await fs.appendFile(
        fn,
        `${date.toLocaleString()} ${levelString} [${this.context}] ${message} ${
          os.EOL
        }`,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async log(message: any) {
    if (this.loggingLevel >= LoggingLevels.LOG) {
      await this.logToFile(message, LoggingLevels.LOG);
      super.log(message);
    }
  }

  async error(message: any) {
    if (this.loggingLevel >= LoggingLevels.ERROR) {
      await this.logToFile(message, LoggingLevels.ERROR);
      super.error(message);
    }
  }

  async warn(message: any) {
    if (this.loggingLevel >= LoggingLevels.WARN) {
      await this.logToFile(message, LoggingLevels.WARN);
      super.warn(message);
    }
  }

  async debug(message: any) {
    if (this.loggingLevel >= LoggingLevels.DEBUG) {
      await this.logToFile(message, LoggingLevels.DEBUG);
      super.debug(message);
    }
  }

  async verbose(message: any) {
    if (this.loggingLevel >= LoggingLevels.VERBOSE) {
      await this.logToFile(message, LoggingLevels.VERBOSE);
      super.verbose(message);
    }
  }
}
