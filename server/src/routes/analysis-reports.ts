import express from 'express';
import { supabase } from '../config/supabase';

const router = express.Router();

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
      return res.status(400).json({ 
        error: 'Missing required fields',
        requestId: req.headers['x-request-id'],
        type: 'ValidationError'
      });
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

    res.status(201).json({
      ...data,
      requestId: req.headers['x-request-id']
    });
  } catch (error) {
    console.error('Error creating analysis report:', error);
    res.status(500).json({ 
      error: 'Failed to create analysis report',
      requestId: req.headers['x-request-id'],
      type: 'DatabaseError'
    });
  }
});

// Get analysis reports by deal
router.get('/deal/:dealId', async (req, res) => {
  try {
    const { dealId } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ 
        error: 'user_id is required',
        requestId: req.headers['x-request-id'],
        type: 'ValidationError'
      });
    }

    const { data, error } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('deal_id', dealId);

    if (error) throw error;

    res.json({
      data: data || [],
      requestId: req.headers['x-request-id']
    });
  } catch (error) {
    console.error('Error fetching analysis reports:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analysis reports',
      requestId: req.headers['x-request-id'],
      type: 'DatabaseError'
    });
  }
});

// Get analysis report by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const requestId = req.headers['x-request-id'] as string;

    const { data, error } = await supabase
      .from('analysis_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Check if it's a "not found" error
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Analysis report not found',
          requestId,
          type: 'NotFoundError'
        });
      }
      throw error;
    }

    res.json({
      ...data,
      requestId
    });
  } catch (error) {
    console.error('Error fetching analysis report:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analysis report',
      requestId: req.headers['x-request-id'],
      type: 'DatabaseError'
    });
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
