import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { anthropicService } from '../services/anthropic';

export const qaRouter = Router();

// Create Q&A entry
qaRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { deal_id, question, answer, context, asked_by } = req.body;

    if (!deal_id || !question || !asked_by) {
      return res.status(400).json({ error: 'deal_id, question, and asked_by are required' });
    }

    // Create Q&A entry
    const { data, error } = await supabase
      .from('qas')
      .insert({
        deal_id,
        question,
        answer,
        context
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating Q&A entry:', error);
      return res.status(500).json({ error: 'Failed to create Q&A entry' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in Q&A:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Q&A entries by deal
qaRouter.get('/deal/:dealId', async (req: Request, res: Response) => {
  try {
    const { dealId } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const { data, error } = await supabase
      .from('qas')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Q&A entries:', error);
      return res.status(500).json({ error: 'Failed to fetch Q&A entries' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching Q&A entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Q&A entry by ID
qaRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('qas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching Q&A entry:', error);
      return res.status(500).json({ error: 'Failed to fetch Q&A entry' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching Q&A entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Q&A entry
qaRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('qas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating Q&A entry:', error);
      return res.status(500).json({ error: 'Failed to update Q&A entry' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error updating Q&A entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Q&A entry
qaRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('qas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting Q&A entry:', error);
      return res.status(500).json({ error: 'Failed to delete Q&A entry' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting Q&A entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI-powered Q&A endpoint
qaRouter.post('/ask', async (req: Request, res: Response) => {
  try {
    const { deal_id, question, context, evidence } = req.body;

    if (!deal_id || !question) {
      return res.status(400).json({ error: 'deal_id and question are required' });
    }

    // Get deal information for context
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', deal_id)
      .single();

    if (dealError) {
      console.error('Error fetching deal data:', dealError);
      return res.status(500).json({ error: 'Failed to fetch deal data' });
    }

    // Build context from deal data
    const dealContext = `
      Deal: ${dealData.title || 'Untitled'}
      Description: ${dealData.description || 'No description'}
      Industry: ${dealData.industry || 'Unknown'}
      Deal Size: ${dealData.deal_size || 'Unknown'}
    `;

    // Generate AI response
    const aiResponse = await anthropicService.generateQAInsights(
      question,
      dealContext,
      evidence || []
    );

    // Create Q&A entry with AI response
    const { data: qaData, error: qaError } = await supabase
      .from('qas')
      .insert({
        deal_id,
        question,
        answer: aiResponse.content,
        context: JSON.stringify({
          deal_context: dealContext,
          evidence: evidence || [],
          ai_confidence: aiResponse.confidence,
          ai_metadata: aiResponse.metadata
        })
      })
      .select()
      .single();

    if (qaError) {
      console.error('Error creating Q&A entry:', qaError);
      return res.status(500).json({ error: 'Failed to create Q&A entry' });
    }

    // Return the AI response with Q&A metadata
    res.json({
      ...qaData,
      ai_response: aiResponse.content,
      confidence: aiResponse.confidence,
      sources: evidence || []
    });

  } catch (error) {
    console.error('Error in AI Q&A:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default qaRouter; 