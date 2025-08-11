import { supabaseAdmin } from '../config/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function initializeDatabase() {
  try {
    // Ensure the Storage bucket used by the app exists
    await ensureDocumentsBucket();
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Helper function to execute raw SQL (you might need to create this as a Supabase function)
export async function executeSQL(sql: string) {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql });
  if (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
  return data;
}

async function ensureDocumentsBucket() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = (buckets || []).some(b => b.name === 'documents');
    if (!exists) {
      await supabaseAdmin.storage.createBucket('documents', {
        public: false,
      });
      console.log('Created storage bucket: documents');
    }
  } catch (error) {
    console.warn('Could not verify/create storage bucket "documents". Continuing...', error);
  }
}