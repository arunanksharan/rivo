/**
 * Logger utility for consistent logging across the application
 * Uses different log levels and structured logging format
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Interface for log entry
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: __DEV__ ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: !__DEV__, // Only send logs to remote in production
};

/**
 * Logger class for structured logging
 */
class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000; // Maximum number of logs to keep in memory

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log a debug message
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   */
  public error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, undefined, error);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: any, error?: any): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Add optional fields
    if (data !== undefined) {
      entry.data = this.sanitizeData(data);
    }

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } as Error;
      } else {
        entry.error = new Error(String(error));
      }
    }

    // Store log
    this.storeLog(entry);

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Send to remote logging service if enabled
    if (this.config.enableRemote) {
      this.sendToRemoteLogging(entry);
    }
  }

  /**
   * Check if we should log this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex >= configLevelIndex;
  }

  /**
   * Store log entry in memory
   */
  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Remove oldest logs if we exceed the maximum
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }
  }

  /**
   * Output log entry to console
   */
  private logToConsole(entry: LogEntry): void {
    const { timestamp, level, message } = entry;
    const prefix = `[${timestamp}] [${level}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, entry.data || '', entry.error || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, entry.data || '', entry.error || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, entry.data || '', entry.error || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, entry.data || '', entry.error || '');
        break;
    }
  }

  /**
   * Send log entry to remote logging service
   */
  private sendToRemoteLogging(entry: LogEntry): void {
    // In a real app, we would send logs to a remote logging service
    // For example, using Firebase Crashlytics, Sentry, etc.
    // This is a placeholder for that functionality
    if (process.env.REMOTE_LOGGING_ENABLED === 'true') {
      // Implementation would depend on the specific service being used
      // For example:
      // Crashlytics.log(`${entry.level}: ${entry.message}`);
      // if (entry.error) {
      //   Crashlytics.recordError(entry.error);
      // }
    }
  }

  /**
   * Sanitize data to prevent sensitive information from being logged
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    // Clone the data to avoid modifying the original
    const sanitized = JSON.parse(JSON.stringify(data));

    // List of sensitive fields to redact
    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'auth',
      'credentials',
      'credit_card',
      'creditCard',
      'ssn',
      'social_security',
      'socialSecurity',
    ];

    // Recursively sanitize objects
    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        
        // Check if this is a sensitive field
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          // Recursively sanitize nested objects
          sanitizeObject(obj[key]);
        }
      });

      return obj;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Get all logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs);
  }

  /**
   * Update logger configuration
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create and export a singleton instance
export const logger = new Logger();
