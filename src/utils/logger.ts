import { AsyncLocalStorage } from 'async_hooks';

export const loggerStorage = new AsyncLocalStorage<{ correlationId: string }>();

export class Logger {
  private static log(level: 'INFO' | 'WARN' | 'ERROR', message: string, meta?: any) {
    const store = loggerStorage.getStore();
    const correlationId = store?.correlationId;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: correlationId || undefined,
      ...meta,
    };
    
    // In test environment, we can optionally format nicely, but JSON is required by Constitution
    console.log(JSON.stringify(logEntry));
  }

  public static info(message: string, meta?: any) {
    this.log('INFO', message, meta);
  }

  public static warn(message: string, meta?: any) {
    this.log('WARN', message, meta);
  }

  public static error(message: string, meta?: any) {
    this.log('ERROR', message, meta);
  }
}
