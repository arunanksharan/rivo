/**
 * Logger utility for consistent logging across the app
 * In a production app, this could be integrated with a remote logging service
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  enableConsole?: boolean;
  minLevel?: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private enableConsole: boolean;
  private minLevel: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.enableConsole = options.enableConsole ?? true;
    this.minLevel = options.minLevel ?? 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enableConsole && LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(message: string, data?: any): string {
    if (!data) return message;
    
    try {
      const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
      return `${message} ${dataString}`;
    } catch (error) {
      return `${message} [Error formatting data]`;
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${this.formatMessage(message, data)}`);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${this.formatMessage(message, data)}`);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${this.formatMessage(message, data)}`);
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      if (error instanceof Error) {
        console.error(`[ERROR] ${message}`, error);
      } else {
        console.error(`[ERROR] ${this.formatMessage(message, error)}`);
      }
    }
  }
}

// Export a singleton instance
export const logger = new Logger({
  enableConsole: __DEV__, // Only log to console in development
  minLevel: __DEV__ ? 'debug' : 'warn', // Lower threshold in development
});
