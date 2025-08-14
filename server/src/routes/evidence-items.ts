import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create evidence item
router.post('/', async (req, res) => {
  try {
    const {
      report_id,
      section_id,
      evidence_type,
      title,
      description,
      source_document_id,
      source_page,
      source_text,
      confidence_score,
      metadata = {}
    } = req.body;

    if (!report_id || !evidence_type || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('evidence_items')
      .insert({
        report_id,
        section_id,
        evidence_type,
        title,
        description,
        source_document_id,
        source_page,
        source_text,
        confidence_score,
        metadata
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating evidence item:', error);
    res.status(500).json({ error: 'Failed to create evidence item' });
  }
});

// Get evidence items by report ID
router.get('/report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const { data, error } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('report_id', reportId);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching evidence items:', error);
    res.status(500).json({ error: 'Failed to fetch evidence items' });
  }
});

// Get evidence items by section ID
router.get('/section/:sectionId', async (req, res) => {
  try {
    const { sectionId } = req.params;

    const { data, error } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('section_id', sectionId);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching evidence items:', error);
    res.status(500).json({ error: 'Failed to fetch evidence items' });
  }
});

// Get evidence item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('evidence_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching evidence item:', error);
    res.status(500).json({ error: 'Failed to fetch evidence item' });
  }
});

// Update evidence item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('evidence_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating evidence item:', error);
    res.status(500).json({ error: 'Failed to update evidence item' });
  }
});

// Delete evidence item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('evidence_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting evidence item:', error);
    res.status(500).json({ error: 'Failed to delete evidence item' });
  }
});

export { router as evidenceItemsRouter };
