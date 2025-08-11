import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const analyzeRouter = Router();

// Analyze documents for a deal
analyzeRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { dealId, userId } = req.body;

    if (!dealId || !userId) {
      return res.status(400).json({ error: 'dealId and userId are required' });
    }

    // Verify the deal belongs to the user
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', dealId)
      .eq('user_id', userId)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    // Get documents for this deal
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('deal_id', dealId);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return res.status(500).json({ error: 'Failed to fetch documents' });
    }

    if (documents.length === 0) {
      return res.status(400).json({ error: 'No documents found for analysis' });
    }

    // TODO: Ryan will implement actual AI analysis (Days 7-8)
    res.status(501).json({ error: 'Analysis not implemented yet - Ryan\'s task (Days 7-8)' });
  } catch (error) {
    console.error('Error in analyze:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default analyzeRouter; 