import { Router, Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import multer from 'multer';
import { parseDocument } from '../services/documentParser';
import { detectFileType } from '../services/fileTypeDetector';

export const filesRouter = Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get pre-signed URL for file upload
filesRouter.post('/upload-url', async (req: Request, res: Response) => {
  try {
    const { filename, deal_id, user_id } = req.body;

    if (!filename || !deal_id || !user_id) {
      return res.status(400).json({ error: 'filename, deal_id, and user_id are required' });
    }

    // Verify the deal belongs to the user
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', deal_id)
      .eq('user_id', user_id)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = filename.split('.').pop();
    
    // Clean filename: remove special characters, replace spaces with underscores
    const cleanFilename = filename
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
    const uniqueFilename = `${deal_id}/${timestamp}-${cleanFilename}`;

    // Create signed URL for upload
    const { data, error } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUploadUrl(uniqueFilename);

    if (error) {
      console.error('Error creating signed URL:', error);
      return res.status(500).json({ error: 'Failed to create upload URL' });
    }

    res.json({
      uploadUrl: data.signedUrl,
      path: uniqueFilename,
      token: data.token
    });
  } catch (error) {
    console.error('Error in upload-url:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm file upload and create document record
filesRouter.post('/confirm-upload', async (req: Request, res: Response) => {
  try {
    const { deal_id, filename, original_name, file_path, file_size, mime_type, user_id } = req.body;

    if (!deal_id || !filename || !original_name || !file_path || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Detect file type
    const fileType = detectFileType(original_name, mime_type);

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        deal_id,
        filename,
        original_name,
        file_path,
        file_size,
        mime_type,
        file_type: fileType
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document record:', error);
      return res.status(500).json({ error: 'Failed to create document record' });
    }

    // Log the action
    await supabase
      .from('logs')
      .insert({
        deal_id,
        user_id,
        action: 'uploaded_document',
        details: { filename: original_name, file_type: fileType }
      });

    res.status(201).json(data);
  } catch (error) {
    console.error('Error in confirm-upload:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Parse a document
filesRouter.post('/parse/:document_id', async (req: Request, res: Response) => {
  try {
    const { document_id } = req.params;
    const { user_id } = req.body;

    // Get document info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        deal:deals!inner(user_id)
      `)
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Verify user has access
    if (document.deal.user_id !== user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return res.status(500).json({ error: 'Failed to download file' });
    }

    // Convert Blob to Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Parse the document
    const parsedText = await parseDocument(fileBuffer, document.mime_type);

    // TODO: Ryan will implement analysis saving (Days 7-8)
    // For now, just return the parsed text
    const analysis = {
      id: `temp-${Date.now()}`,
      document_id,
      parsed_text: parsedText,
      analysis_type: 'text_extraction',
      analysis_result: {
        word_count: parsedText.split(' ').length,
        extraction_timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error in parse document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get documents for a deal
filesRouter.get('/deal/:deal_id', async (req: Request, res: Response) => {
  try {
    const { deal_id } = req.params;
    const { user_id } = req.query;

    // Verify user has access to the deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', deal_id)
      .eq('user_id', user_id)
      .single();

    if (dealError || !deal) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    // Get documents
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        analyses:analyses(*)
      `)
      .eq('deal_id', deal_id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ error: 'Failed to fetch documents' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error in get documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});