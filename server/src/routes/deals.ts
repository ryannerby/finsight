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

    // Add default is_saved value if the column doesn't exist
    const dealsWithDefaults = data?.map(deal => ({
      ...deal,
      is_saved: deal.is_saved !== undefined ? deal.is_saved : false
    })) || [];

    res.json(dealsWithDefaults);
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

    // Add default is_saved value if the column doesn't exist
    const dealWithDefaults = {
      ...data,
      is_saved: data.is_saved !== undefined ? data.is_saved : false
    };

    res.json(dealWithDefaults);
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

    // Try to update the saved status, but handle the case where the column doesn't exist
    try {
      const { data, error } = await supabase
        .from('deals')
        .update({ is_saved: is_saved })
        .eq('id', id)
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) {
        // Detect PostgREST cache error or missing column scenarios
        const errorCode = (error as any).code || '';
        const errorMessage = (error.message || '').toLowerCase();
        const errorDetails = (error.details || '').toLowerCase();
        const errorHint = (error.hint || '').toLowerCase();
        const indicatesMissingColumn = (
          errorCode === 'PGRST204' ||
          errorMessage.includes("could not find the 'is_saved' column") ||
          errorDetails.includes("could not find the 'is_saved' column") ||
          errorHint.includes("could not find the 'is_saved' column") ||
          errorMessage.includes('column "is_saved" does not exist') ||
          errorDetails.includes('column "is_saved" does not exist') ||
          errorHint.includes('column "is_saved" does not exist') ||
          errorMessage.includes('undefined column') ||
          errorMessage.includes('does not exist')
        );
        
        if (indicatesMissingColumn) {
          console.warn('is_saved column not available. Returning mocked updated deal.');
          try {
            await supabase
              .from('logs')
              .insert({
                deal_id: id,
                user_id,
                action: is_saved ? 'saved_deal' : 'unsaved_deal',
                details: { is_saved, fallback: true }
              });
          } catch (logError) {
            console.warn('Could not log save action (fallback):', logError);
          }
          return res.json({ ...deal, is_saved: is_saved } as any);
        }
        
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
    } catch (updateError) {
      // Handle any other errors during update
      console.error('Error in save deal update:', updateError);
      
      // Return a mock response as fallback
      res.json({ ...deal, is_saved: is_saved } as any);
    }
  } catch (error) {
    console.error('Error in save deal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update deal
dealsRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id, description } = req.body;

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

    // Prepare update data
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;

    // Update the deal
    const { data, error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating deal:', error);
      return res.status(500).json({ error: 'Failed to update deal' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in update deal:', error);
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

    // First try to get deals with is_saved filter
    try {
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
        const errorCode = (error as any).code || '';
        const errorMessage = (error.message || '').toLowerCase();
        
        // If the column doesn't exist or PostgREST cache can't find it, fallback
        if (
          errorCode === 'PGRST204' ||
          errorMessage.includes("could not find the 'is_saved' column") ||
          errorMessage.includes('column "is_saved" does not exist')
        ) {
          console.warn('is_saved column not available for filter; returning empty saved list.');
          res.json([]);
          return;
        }
        
        console.error('Error fetching saved deals:', error);
        return res.status(500).json({ error: 'Failed to fetch saved deals' });
      }

      res.json(data);
    } catch (filterError) {
      // Handle any other errors during filtering
      console.error('Error in saved deals filter:', filterError);
      
      // Return empty array as fallback
      res.json([]);
    }
  } catch (error) {
    console.error('Error in get saved deals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});