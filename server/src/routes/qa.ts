import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const qaRouter = Router();

// Handle Q&A requests
qaRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { dealId, question } = req.body;

    if (!dealId || !question) {
      return res.status(400).json({ error: 'dealId and question are required' });
    }

    // TODO: Ryan will implement actual AI Q&A (Days 9-10)
    res.status(501).json({ error: 'Q&A not implemented yet - Ryan\'s task (Days 9-10)' });
  } catch (error) {
    console.error('Error in Q&A:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default qaRouter; 