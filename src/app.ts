import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { loggerStorage, Logger } from './utils/logger';
import { ValidatorController } from './controllers/validator.controller';

const app = express();

// Enable JSON body parser
app.use(express.json());

// Correlation ID & Async Local Storage Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req.header('X-Correlation-ID') || req.header('x-correlation-id') || uuidv4()) as string;
  res.setHeader('X-Correlation-ID', correlationId);

  loggerStorage.run({ correlationId }, () => {
    Logger.info(`${req.method} ${req.url} started`);
    next();
  });
});

// Basic Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Register Core Validator Endpoint
app.post('/api/v1/validate', ValidatorController.validate);

// Custom Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  Logger.error('Unhandled server error', { error: err.message });
  
  res.status(500).json({
    success: false,
    correlationId: res.getHeader('X-Correlation-ID') || 'unknown',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred on the server.'
    }
  });
});

export default app;
