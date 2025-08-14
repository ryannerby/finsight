import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create report section
router.post('/', async (req, res) => {
  try {
    const {
      report_id,
      section_type,
      title,
      content,
      order_index,
      is_required = true
    } = req.body;

    if (!report_id || !section_type || !title || order_index === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('report_sections')
      .insert({
        report_id,
        section_type,
        title,
        content,
        order_index,
        is_required
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating report section:', error);
    res.status(500).json({ error: 'Failed to create report section' });
  }
});

// Get report sections by report ID
router.get('/report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const { data, error } = await supabase
      .from('report_sections')
      .select('*')
      .eq('report_id', reportId)
      .order('order_index');

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching report sections:', error);
    res.status(500).json({ error: 'Failed to fetch report sections' });
  }
});

// Get report section by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('report_sections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching report section:', error);
    res.status(500).json({ error: 'Failed to fetch report section' });
  }
});

// Update report section
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('report_sections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating report section:', error);
    res.status(500).json({ error: 'Failed to update report section' });
  }
});

// Delete report section
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('report_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting report section:', error);
    res.status(500).json({ error: 'Failed to delete report section' });
  }
});

export { router as reportSectionsRouter };
