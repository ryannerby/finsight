import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

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

export default qaRouter; 