import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';

export const dealsRouter = Router();

// Create a new deal
dealsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, user_id } = req.body;

    if (!title || !user_id) {
      return res.status(400).json({ error: 'Title and user_id are required' });
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({
        title,
        description,
        user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deal:', error);
      return res.status(500).json({ error: 'Failed to create deal' });
    }

    // Log the action
    await supabase
      .from('logs')
      .insert({
        deal_id: data.id,
        user_id,
        action: 'created_deal',
        details: { title, description }
      });

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in create deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a deal (and related documents). Requires user_id to verify ownership
dealsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = (req.query.user_id as string) || (req.body && (req.body as any).user_id);

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Verify the deal belongs to the user
    const { data: deal, error: findError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (findError || !deal) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    // Attempt to remove storage objects under this deal folder
    try {
      const { data: objects } = await supabaseAdmin.storage
        .from('documents')
        .list(id, { limit: 1000 });

      if (objects && objects.length > 0) {
        const paths = objects.map((o) => `${id}/${o.name}`);
        await supabaseAdmin.storage.from('documents').remove(paths);
      }
    } catch (e) {
      console.warn('Storage cleanup failed (continuing):', e);
    }

    // Delete the deal (FK cascades will remove documents/analyses/logs rows)
    const { error: deleteError } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (deleteError) {
      console.error('Error deleting deal:', deleteError);
      return res.status(500).json({ error: 'Failed to delete deal' });
    }

    // Log the action
    await supabase
      .from('logs')
      .insert({
        deal_id: id,
        user_id,
        action: 'deleted_deal',
        details: {}
      });

    return res.status(204).send();
  } catch (error) {
    console.error('Error in delete deal:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deals for a user
dealsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        documents:documents(count)
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deals:', error);
      return res.status(500).json({ error: 'Failed to fetch deals' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in get deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific deal
dealsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        documents:documents(*),
        qas:qas(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching deal:', error);
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in get deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save/unsave a deal
dealsRouter.patch('/:id/save', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, is_saved } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Verify the deal belongs to the user
    const { data: deal, error: findError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (findError || !deal) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    // Update the saved status
    const { data, error } = await supabase
      .from('deals')
      .update({ is_saved: is_saved })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deal save status:', error);
      return res.status(500).json({ error: 'Failed to update deal save status' });
    }

    // Log the action
    await supabase
      .from('logs')
      .insert({
        deal_id: id,
        user_id,
        action: is_saved ? 'saved_deal' : 'unsaved_deal',
        details: { is_saved }
      });

    res.json(data);
  } catch (error) {
    console.error('Error in save deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get saved deals for a user
dealsRouter.get('/saved/all', async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        documents:documents(count)
      `)
      .eq('user_id', user_id)
      .eq('is_saved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved deals:', error);
      return res.status(500).json({ error: 'Failed to fetch saved deals' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in get saved deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});