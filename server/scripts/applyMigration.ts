import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase';

async function applyMigration() {
  try {
    console.log('Applying migration: Add metrics columns to deals table...');

    // Add health_score column
    const { error: healthScoreError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS health_score INTEGER;'
    });
    
    if (healthScoreError) {
      console.log('Note: health_score column might already exist or need manual creation');
    } else {
      console.log('✅ Added health_score column');
    }

    // Add metrics column
    const { error: metricsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS metrics JSONB;'
    });
    
    if (metricsError) {
      console.log('Note: metrics column might already exist or need manual creation');
    } else {
      console.log('✅ Added metrics column');
    }

    // Add is_saved column
    const { error: isSavedError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT FALSE;'
    });
    
    if (isSavedError) {
      console.log('Note: is_saved column might already exist or need manual creation');
    } else {
      console.log('✅ Added is_saved column');
    }

    // Add indexes
    const { error: indexError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_deals_health_score ON deals(health_score);
        CREATE INDEX IF NOT EXISTS idx_deals_is_saved ON deals(is_saved);
        CREATE INDEX IF NOT EXISTS idx_deals_user_saved ON deals(user_id, is_saved);
      `
    });
    
    if (indexError) {
      console.log('Note: indexes might already exist or need manual creation');
    } else {
      console.log('✅ Added indexes');
    }

    console.log('🎉 Migration completed successfully!');
    
    // Verify the columns exist by trying to select them
    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('id, health_score, metrics, is_saved')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Warning: Could not verify columns. You may need to apply the migration manually.');
      console.log('Error:', error.message);
    } else {
      console.log('✅ Columns verified successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyMigration(); 