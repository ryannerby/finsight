import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST - before any other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import everything else
import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { dealsRouter } from './routes/deals';
import { filesRouter } from './routes/files';
import { analyzeRouter } from './routes/analyze';
import { qaRouter } from './routes/qa';
import { exportRouter } from './routes/export';
import { analysisReportsRouter } from './routes/analysis-reports';
import { reportSectionsRouter } from './routes/report-sections';
import { evidenceItemsRouter } from './routes/evidence-items';
import { analysesRouter } from './routes/analyses';
import { logsRouter } from './routes/logs';
import { mockRouter } from './routes/mock';
import { testErrorRouter } from './routes/test-error';
import { logger, generateRequestId, createRequestLogger } from './lib/logger';

const app = express();

// Request ID middleware - must be first
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  
  // Add request logger to req object for use in routes
  (req as any).logger = createRequestLogger(requestId);
  
  next();
});

// Request logging middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const startTime = Date.now();
  const requestLogger = (req as any).logger;
  
  // Log request start
  requestLogger.info('Request started', {
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - startTime;
    
    requestLogger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
    
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/files', filesRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/qa', qaRouter);
app.use('/api/export', exportRouter);
app.use('/api/analysis-reports', analysisReportsRouter);
app.use('/api/report-sections', reportSectionsRouter);
app.use('/api/evidence-items', evidenceItemsRouter);
app.use('/api/analyses', analysesRouter);
app.use('/api/logs', logsRouter);

// Mock mode routes for testing without database
app.use('/api/mock', mockRouter);

// Test error routes (for testing error handling)
app.use('/api/test-error', testErrorRouter);

// Temporary debug route to enumerate all registered routes
app.get('/api/debug/routes', (req: express.Request, res: express.Response) => {
  const routes: Array<{ path: string; methods: string[] }> = [];
  
  // Get all registered routes
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Routes registered directly on the app
      const path = middleware.route.path;
      const methods = Object.keys(middleware.route.methods);
      routes.push({ path, methods });
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          const path = handler.route.path;
          const methods = Object.keys(handler.route.methods);
          routes.push({ path, methods });
        }
      });
    }
  });
  
  res.json({
    routes,
    requestId: req.headers['x-request-id']
  });
});

// 404 handler - must come before error handling middleware
app.use('*', (req: express.Request, res: express.Response) => {
  const requestId = req.headers['x-request-id'] as string;
  const requestLogger = (req as any).logger || logger;
  
  requestLogger.warn('Route not found', {
    method: req.method,
    path: req.originalUrl,
    requestId,
  });
  
  res.status(404).json({
    error: {
      type: 'NotFound',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      requestId,
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = req.headers['x-request-id'] as string;
  const requestLogger = (req as any).logger || logger;
  
  // Log the full error with context
  requestLogger.error('Unhandled error occurred', {
    errorName: err.name,
    errorMessage: err.message,
    errorStack: err.stack,
    requestId,
    method: req.method,
    path: req.path,
  });
  
  // Return structured error response
  res.status(err.status || 500).json({
    error: {
      type: err.name || 'InternalServerError',
      message: err.message || 'Something went wrong!',
      requestId,
    },
  });
});

export { app };
