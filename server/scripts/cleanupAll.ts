import 'dotenv/config';

const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  const userId = 'user_123';
  console.log('🧹 Starting comprehensive cleanup of all deals...');

  try {
    // 1) Get all deals for the user
    const deals = await fetchJSON(`${API_BASE_URL}/deals?user_id=${userId}`);
    console.log(`📊 Found ${deals.length} total deals`);

    if (deals.length === 0) {
      console.log('🎉 No deals to clean up! Database is already clean.');
      return;
    }

    // 2) Delete all deals (this will cascade delete documents, analyses, etc.)
    console.log('\n🗑️  Deleting all deals and associated data...');
    let deletedCount = 0;
    
    for (const deal of deals) {
      try {
        await fetchJSON(`${API_BASE_URL}/deals/${deal.id}?user_id=${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        deletedCount++;
        console.log(`   ✅ Deleted deal: ${deal.id} - ${deal.title}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete deal ${deal.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   • Deleted ${deletedCount} deals and all associated data`);
    
    // 3) Verify cleanup
    const remainingDeals = await fetchJSON(`${API_BASE_URL}/deals?user_id=${userId}`);
    console.log(`\n📊 Verification: ${remainingDeals.length} deals remaining`);
    
    if (remainingDeals.length === 0) {
      console.log('✅ Success: All deals have been removed!');
      console.log('\n💡 You can now run the seed script to create fresh, properly structured deals.');
    } else {
      console.log('⚠️  Warning: Some deals may still exist');
    }

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
}

async function fetchJSON(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${init?.method || 'GET'} ${url} failed: ${res.status} ${res.statusText} - ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`❌ Error in ${init?.method || 'GET'} ${url}:`, error);
    throw error;
  }
}

main().catch(err => {
  console.error('💥 Cleanup failed:', err);
  process.exit(1);
});
