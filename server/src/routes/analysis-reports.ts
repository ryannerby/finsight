import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create analysis report
router.post('/', async (req, res) => {
  try {
    const {
      deal_id,
      report_type,
      title,
      description,
      status = 'draft',
      generated_by,
      metadata = {}
    } = req.body;

    if (!deal_id || !report_type || !title || !generated_by) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('analysis_reports')
      .insert({
        deal_id,
        report_type,
        title,
        description,
        status,
        generated_by,
        metadata
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating analysis report:', error);
    res.status(500).json({ error: 'Failed to create analysis report' });
  }
});

// Get analysis reports by deal
router.get('/deal/:dealId', async (req, res) => {
  try {
    const { dealId } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const { data, error } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('deal_id', dealId);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching analysis reports:', error);
    res.status(500).json({ error: 'Failed to fetch analysis reports' });
  }
});

// Get analysis report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching analysis report:', error);
    res.status(500).json({ error: 'Failed to fetch analysis report' });
  }
});

// Update analysis report
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('analysis_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating analysis report:', error);
    res.status(500).json({ error: 'Failed to update analysis report' });
  }
});

// Delete analysis report
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('analysis_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting analysis report:', error);
    res.status(500).json({ error: 'Failed to delete analysis report' });
  }
});

export { router as analysisReportsRouter };
