import 'dotenv/config';
import { supabaseAdmin } from '../src/config/supabase';

async function checkSchema() {
  try {
    console.log('Checking current deals table schema...');

    // Try to select all columns to see what exists
    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error accessing deals table:', error.message);
      return;
    }

    console.log('✅ Deals table accessible');
    console.log('Sample deal data:', data);

    // Try to select specific columns to see which ones exist
    const columns = ['id', 'user_id', 'title', 'description', 'health_score', 'metrics', 'is_saved'];
    
    for (const column of columns) {
      try {
        const { error: colError } = await supabaseAdmin
          .from('deals')
          .select(column)
          .limit(1);
        
        if (colError) {
          console.log(`❌ Column '${column}' does NOT exist:`, colError.message);
        } else {
          console.log(`✅ Column '${column}' exists`);
        }
      } catch (e) {
        console.log(`❌ Column '${column}' does NOT exist`);
      }
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema(); 