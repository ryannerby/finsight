import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded even if this module is imported
// before the server's main entrypoint configures dotenv. This happens because
// TypeScript import statements are hoisted and evaluated before top-level code.
// We attempt to load both .env.local (if present) and .env from the server root.
const serverRootEnv = path.join(__dirname, '../../.env');
const serverRootEnvLocal = path.join(__dirname, '../../.env.local');

// Load .env.local first (if it exists), then .env
dotenv.config({ path: serverRootEnvLocal });
dotenv.config({ path: serverRootEnv });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Client for user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for service operations
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);