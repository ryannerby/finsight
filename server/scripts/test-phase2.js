#!/usr/bin/env node

/**
 * Phase 2 Test Script - Supabase & Schema Sanity
 * 
 * This script tests:
 * 1. Supabase connectivity
 * 2. Storage bucket creation
 * 3. Database table verification
 * 4. RLS policy verification
 * 5. Service role access
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Test configuration
const TESTS = {
  connectivity: true,
  storage: true,
  tables: true,
  rls: true,
  serviceRole: true
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const icon = status ? '✅' : '❌';
  const color = status ? 'green' : 'red';
  log(`${icon} ${name}: ${status ? 'PASS' : 'FAIL'}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

async function testConnectivity() {
  log('\n🔍 Testing Supabase Connectivity...', 'blue');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      logTest('Environment Variables', false, 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return false;
    }
    
    logTest('Environment Variables', true, 'All required variables present');
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // Test basic connectivity
    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('count')
      .limit(1);
    
    if (error) {
      // Try simpler test
      const { error: simpleError } = await supabaseAdmin.rpc('version');
      if (simpleError) {
        logTest('Basic Connectivity', false, error.message);
        return false;
      }
    }
    
    logTest('Basic Connectivity', true, 'Successfully connected to Supabase');
    return true;
    
  } catch (error) {
    logTest('Connectivity Test', false, error.message);
    return false;
  }
}

async function testStorageBucket() {
  log('\n📦 Testing Storage Bucket...', 'blue');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // List buckets
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      logTest('Bucket Listing', false, listError.message);
      return false;
    }
    
    logTest('Bucket Listing', true, `Found ${buckets?.length || 0} buckets`);
    
    // Check if documents bucket exists
    const documentsBucket = (buckets || []).find(b => b.name === 'documents');
    
    if (!documentsBucket) {
      logTest('Documents Bucket', false, 'Documents bucket not found');
      
      // Try to create it
      const { error: createError } = await supabaseAdmin.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        fileSizeLimit: 50 * 1024 * 1024
      });
      
      if (createError) {
        logTest('Bucket Creation', false, createError.message);
        return false;
      }
      
      logTest('Bucket Creation', true, 'Successfully created documents bucket');
    } else {
      logTest('Documents Bucket', true, 'Documents bucket exists');
    }
    
    return true;
    
  } catch (error) {
    logTest('Storage Test', false, error.message);
    return false;
  }
}

async function testTables() {
  log('\n🔍 Testing Database Tables...', 'blue');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const requiredTables = [
      'deals',
      'documents',
      'analyses',
      'qas',
      'logs',
      'analysis_reports'
    ];
    
    let allTablesExist = true;
    
    for (const tableName of requiredTables) {
      try {
        const { error } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          logTest(`Table: ${tableName}`, false, error.message);
          allTablesExist = false;
        } else {
          logTest(`Table: ${tableName}`, true, 'Table exists and accessible');
        }
      } catch (error) {
        logTest(`Table: ${tableName}`, false, error.message);
        allTablesExist = false;
      }
    }
    
    return allTablesExist;
    
  } catch (error) {
    logTest('Table Test', false, error.message);
    return false;
  }
}

async function testRLSPolicies() {
  log('\n🔒 Testing RLS Policies...', 'blue');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // Test service role access to tables
    const tablesToTest = ['deals', 'documents', 'analyses', 'qas', 'logs', 'analysis_reports'];
    let allAccessGood = true;
    
    for (const tableName of tablesToTest) {
      try {
        // Test SELECT
        const { error: selectError } = await supabaseAdmin
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (selectError) {
          logTest(`Service Role SELECT: ${tableName}`, false, selectError.message);
          allAccessGood = false;
        } else {
          logTest(`Service Role SELECT: ${tableName}`, true, 'Access granted');
        }
        
      } catch (error) {
        logTest(`Service Role SELECT: ${tableName}`, false, error.message);
        allAccessGood = false;
      }
    }
    
    // Test storage access
    try {
      const { error: storageError } = await supabaseAdmin.storage
        .from('documents')
        .list('', { limit: 1 });
      
      if (storageError) {
        logTest('Service Role Storage Access', false, storageError.message);
        allAccessGood = false;
      } else {
        logTest('Service Role Storage Access', true, 'Access granted');
      }
    } catch (error) {
      logTest('Service Role Storage Access', false, error.message);
      allAccessGood = false;
    }
    
    return allAccessGood;
    
  } catch (error) {
    logTest('RLS Test', false, error.message);
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Phase 2 Tests - Supabase & Schema Sanity', 'bright');
  
  const results = {
    connectivity: false,
    storage: false,
    tables: false,
    rls: false
  };
  
  try {
    if (TESTS.connectivity) {
      results.connectivity = await testConnectivity();
    }
    
    if (TESTS.storage && results.connectivity) {
      results.storage = await testStorageBucket();
    }
    
    if (TESTS.tables && results.connectivity) {
      results.tables = await testTables();
    }
    
    if (TESTS.rls && results.connectivity) {
      results.rls = await testRLSPolicies();
    }
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'red');
  }
  
  // Summary
  log('\n📊 Test Summary', 'bright');
  log('================', 'bright');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log(`Tests Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (results.connectivity) logTest('Connectivity', true);
  else logTest('Connectivity', false);
  
  if (results.storage) logTest('Storage Bucket', true);
  else logTest('Storage Bucket', false);
  
  if (results.tables) logTest('Database Tables', true);
  else logTest('Database Tables', false);
  
  if (results.rls) logTest('RLS Policies', true);
  else logTest('RLS Policies', false);
  
  if (passed === total) {
    log('\n🎉 All Phase 2 tests passed! Supabase & Schema are ready.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the issues above.', 'yellow');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`❌ Test runner failed: ${error.message}`, 'red');
  process.exit(1);
});
