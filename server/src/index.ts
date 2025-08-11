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
import { initializeDatabase } from './database/init';

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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;