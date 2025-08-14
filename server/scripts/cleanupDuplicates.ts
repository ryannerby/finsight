import 'dotenv/config';

const API_BASE_URL = 'http://localhost:3001/api';

async function main() {
  const userId = 'user_123';
  console.log('🧹 Starting cleanup of duplicate deals...');

  try {
    // 1) Get all deals for the user
    const deals = await fetchJSON(`${API_BASE_URL}/deals?user_id=${userId}`);
    console.log(`📊 Found ${deals.length} total deals`);

    // 2) Group deals by title to identify duplicates
    const dealsByTitle = new Map<string, any[]>();
    
    deals.forEach(deal => {
      if (!dealsByTitle.has(deal.title)) {
        dealsByTitle.set(deal.title, []);
      }
      dealsByTitle.get(deal.title)!.push(deal);
    });

    // 3) Identify duplicates and keep the most recent one
    const dealsToDelete: string[] = [];
    const dealsToKeep: string[] = [];

    dealsByTitle.forEach((dealsWithSameTitle, title) => {
      if (dealsWithSameTitle.length > 1) {
        console.log(`🔄 Found ${dealsWithSameTitle.length} duplicates for "${title}"`);
        
        // Sort by creation date (newest first) and keep the first one
        const sortedDeals = dealsWithSameTitle.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Keep the first (most recent) deal
        dealsToKeep.push(sortedDeals[0].id);
        
        // Mark the rest for deletion
        dealsToDelete.push(...sortedDeals.slice(1).map(d => d.id));
        
        console.log(`   ✅ Keeping: ${sortedDeals[0].id} (created: ${sortedDeals[0].created_at})`);
        console.log(`   🗑️  Deleting: ${sortedDeals.slice(1).map(d => d.id).join(', ')}`);
      } else {
        // Only one deal with this title, keep it
        dealsToKeep.push(dealsWithSameTitle[0].id);
      }
    });

    console.log(`\n📋 Summary:`);
    console.log(`   • Total deals found: ${deals.length}`);
    console.log(`   • Unique deal titles: ${dealsByTitle.size}`);
    console.log(`   • Deals to keep: ${dealsToKeep.length}`);
    console.log(`   • Deals to delete: ${dealsToDelete.length}`);

    if (dealsToDelete.length === 0) {
      console.log('🎉 No duplicates found! Database is clean.');
      return;
    }

    // 4) Delete duplicate deals
    console.log('\n🗑️  Deleting duplicate deals...');
    let deletedCount = 0;
    
    for (const dealId of dealsToDelete) {
      try {
        await fetchJSON(`${API_BASE_URL}/deals/${dealId}?user_id=${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        deletedCount++;
        console.log(`   ✅ Deleted deal: ${dealId}`);
      } catch (error) {
        console.error(`   ❌ Failed to delete deal ${dealId}:`, error.message);
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   • Deleted ${deletedCount} duplicate deals`);
    console.log(`   • Kept ${dealsToKeep.length} unique deals`);
    
    // 5) Verify the cleanup
    const remainingDeals = await fetchJSON(`${API_BASE_URL}/deals?user_id=${userId}`);
    console.log(`\n📊 Verification: ${remainingDeals.length} deals remaining`);
    
    const remainingTitles = remainingDeals.map((d: any) => d.title);
    const uniqueTitles = new Set(remainingTitles);
    
    if (remainingTitles.length === uniqueTitles.size) {
      console.log('✅ Success: No duplicate titles remaining!');
    } else {
      console.log('⚠️  Warning: Some duplicates may still exist');
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
