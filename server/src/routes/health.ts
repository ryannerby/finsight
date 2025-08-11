import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});