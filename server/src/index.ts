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
// Temporarily comment out database initialization to get Q&A working
// import { initializeDatabase } from './database/init';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
  try {
    // Temporarily comment out database initialization to get Q&A working
    // await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Q&A service available at http://localhost:${PORT}/api/qa`);
      console.log(`Mock mode available at http://localhost:${PORT}/api/mock/status`);
      console.log(`⚠️  NOTE: Running in mock mode - no real database operations`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;