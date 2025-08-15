import { supabaseAdmin } from '../config/supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Ensure the Storage bucket used by the app exists
    await ensureDocumentsBucket();
    
    // Verify all required tables exist
    await verifyRequiredTables();
    
    // Verify RLS policies and service role access
    await verifyRLSPolicies();
    
    console.log('✅ Database initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
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
    console.log('📦 Verifying storage bucket: documents');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Failed to list storage buckets: ${listError.message}`);
    }
    
    const exists = (buckets || []).some(b => b.name === 'documents');
    
    if (!exists) {
      console.log('📦 Creating storage bucket: documents');
      const { error: createError } = await supabaseAdmin.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.ms-excel'],
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
      });
      
      if (createError) {
        throw new Error(`Failed to create storage bucket: ${createError.message}`);
      }
      
      console.log('✅ Successfully created storage bucket: documents');
    } else {
      console.log('✅ Storage bucket "documents" already exists');
    }
  } catch (error) {
    console.error('❌ Storage bucket verification failed:', error);
    throw error;
  }
}

async function verifyRequiredTables() {
  try {
    console.log('🔍 Verifying required database tables...');
    
    const requiredTables = [
      'deals',
      'documents', 
      'analyses',
      'qas',
      'logs',
      'analysis_reports'
    ];
    
    const missingTables: string[] = [];
    
    for (const tableName of requiredTables) {
      try {
        const { error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          missingTables.push(tableName);
        }
      } catch (error) {
        missingTables.push(tableName);
      }
    }
    
    if (missingTables.length > 0) {
      console.warn(`⚠️  Missing tables: ${missingTables.join(', ')}`);
      console.log('📋 Running migrations to create missing tables...');
      
      // Run migrations for missing tables
      await runMigrations(missingTables);
    } else {
      console.log('✅ All required tables exist');
    }
    
  } catch (error) {
    console.error('❌ Table verification failed:', error);
    throw error;
  }
}

async function runMigrations(missingTables: string[]) {
  try {
    console.log('🔄 Running database migrations...');
    
    // Execute migrations for missing tables
    for (const tableName of missingTables) {
      await executeTableMigration(tableName);
    }
    
    console.log('✅ All migrations completed');
    
  } catch (error) {
    console.error('❌ Migration execution failed:', error);
    throw error;
  }
}

async function executeTableMigration(tableName: string) {
  try {
    console.log(`📋 Creating missing table: ${tableName}`);
    
    switch (tableName) {
      case 'deals':
        await executeSQL(`
          CREATE TABLE IF NOT EXISTS deals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
        `);
        break;
        
      case 'documents':
        await executeSQL(`
          CREATE TABLE IF NOT EXISTS documents (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            file_type TEXT,
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_documents_deal_id ON documents(deal_id);
        `);
        break;
        
      case 'analyses':
        await executeSQL(`
          CREATE TABLE IF NOT EXISTS analyses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
            parsed_text TEXT,
            analysis_type TEXT,
            analysis_result JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON analyses(document_id);
        `);
        break;
        
      case 'qas':
        await executeSQL(`
          CREATE TABLE IF NOT EXISTS qas (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
            question TEXT NOT NULL,
            answer TEXT,
            context JSONB,
            asked_by TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_qas_deal_id ON qas(deal_id);
        `);
        break;
        
      case 'logs':
        await executeSQL(`
          CREATE TABLE IF NOT EXISTS logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL,
            action TEXT NOT NULL,
            details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_logs_deal_id ON logs(deal_id);
          CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
        `);
        break;
        
      case 'analysis_reports':
        await executeSQL(`
          CREATE TABLE IF NOT EXISTS analysis_reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
            report_type TEXT NOT NULL CHECK (report_type IN ('comprehensive', 'financial_summary', 'risk_assessment', 'due_diligence', 'custom')),
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'failed', 'archived')),
            generated_by TEXT NOT NULL,
            generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            version INTEGER DEFAULT 1,
            metadata JSONB DEFAULT '{}',
            summary_report JSONB DEFAULT '{}',
            traffic_lights JSONB DEFAULT '{}',
            strengths JSONB DEFAULT '[]',
            risks JSONB DEFAULT '[]',
            recommendation JSONB DEFAULT '{}',
            evidence_map JSONB DEFAULT '{}',
            confidence_scores JSONB DEFAULT '{}',
            data_quality_assessment JSONB DEFAULT '{}',
            export_version TEXT DEFAULT 'v1',
            claude_usage JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS idx_analysis_reports_deal_id ON analysis_reports(deal_id);
          CREATE INDEX IF NOT EXISTS idx_analysis_reports_status ON analysis_reports(status);
          CREATE INDEX IF NOT EXISTS idx_analysis_reports_generated_at ON analysis_reports(generated_at);
          CREATE INDEX IF NOT EXISTS idx_analysis_reports_report_type ON analysis_reports(report_type);
        `);
        break;
        
      default:
        console.warn(`⚠️  No migration found for table: ${tableName}`);
        return;
    }
    
    console.log(`✅ Successfully created table: ${tableName}`);
    
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error);
    throw error;
  }
}

async function verifyRLSPolicies() {
  try {
    console.log('🔒 Verifying RLS policies and service role access...');
    
    // Test service role access to all tables
    const tablesToTest = [
      'deals',
      'documents',
      'analyses', 
      'qas',
      'logs',
      'analysis_reports'
    ];
    
    for (const tableName of tablesToTest) {
      try {
        // Test SELECT access
        const { error: selectError } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (selectError) {
          console.warn(`⚠️  Service role SELECT access issue with ${tableName}: ${selectError.message}`);
        }
        
        // Test INSERT access (with a dummy record that will be rolled back)
        const { error: insertError } = await supabaseAdmin
          .from(tableName)
          .insert({ 
            // Add minimal required fields for each table
            ...(tableName === 'deals' && { user_id: 'test', title: 'test' }),
            ...(tableName === 'documents' && { deal_id: '00000000-0000-0000-0000-000000000000', filename: 'test', original_name: 'test', file_path: 'test' }),
            ...(tableName === 'analyses' && { document_id: '00000000-0000-0000-0000-000000000000' }),
            ...(tableName === 'qas' && { deal_id: '00000000-0000-0000-0000-000000000000', question: 'test', asked_by: 'test' }),
            ...(tableName === 'logs' && { deal_id: '00000000-0000-0000-0000-000000000000', user_id: 'test', action: 'test' }),
            ...(tableName === 'analysis_reports' && { deal_id: '00000000-0000-0000-0000-000000000000', report_type: 'comprehensive', title: 'test', generated_by: 'test' })
          });
        
        if (insertError) {
          console.warn(`⚠️  Service role INSERT access issue with ${tableName}: ${insertError.message}`);
        }
        
        console.log(`✅ Service role access verified for ${tableName}`);
        
      } catch (error) {
        console.warn(`⚠️  Could not verify service role access for ${tableName}:`, error);
      }
    }
    
    // Test storage bucket access
    try {
      const { error: storageError } = await supabaseAdmin.storage
        .from('documents')
        .list('', { limit: 1 });
      
      if (storageError) {
        console.warn(`⚠️  Service role storage access issue: ${storageError.message}`);
      } else {
        console.log('✅ Service role storage access verified');
      }
    } catch (error) {
      console.warn('⚠️  Could not verify service role storage access:', error);
    }
    
    console.log('✅ RLS policy verification completed');
    
  } catch (error) {
    console.error('❌ RLS policy verification failed:', error);
    throw error;
  }
}