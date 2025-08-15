import { randomUUID } from 'crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  [key: string]: any;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  child(context: LogContext): Logger;
}

class ConsoleLogger implements Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || this.context.requestId;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${requestId ? ` [req:${requestId}]` : ''}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));
  }

  child(context: LogContext): Logger {
    return new ConsoleLogger({ ...this.context, ...context });
  }
}

// Create a default logger instance
export const logger = new ConsoleLogger();

// Utility to generate request IDs
export const generateRequestId = (): string => randomUUID();

// Utility to create a logger with a specific request ID
export const createRequestLogger = (requestId: string): Logger => {
  return logger.child({ requestId });
};
