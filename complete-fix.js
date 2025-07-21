// Complete localStorage cleanup script
// Copy and paste this into browser console to fix the issue

console.log('🧹 CLEANBAGE - Complete localStorage Cleanup');
console.log('===========================================');

// Show what's currently stored
console.log('📋 Current localStorage contents:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value.substring(0, 100) + (value.length > 100 ? '...' : ''));
}

// Clear all CleanBage related data
console.log('\n🗑️  Clearing localStorage...');
localStorage.removeItem('wasteManagementUser');
localStorage.removeItem('registeredUsers');
localStorage.removeItem('userBalance');
localStorage.removeItem('recentTransactions');

// Clear any notification data
Object.keys(localStorage).forEach(key => {
  if (key.includes('pendingNotifications') || key.includes('cleanbage') || key.includes('CleanBage')) {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  }
});

console.log('✅ localStorage cleaned successfully!');
console.log('\n📝 Next steps:');
console.log('1. Refresh the page (F5)');
console.log('2. Login fresh as user "m":');
console.log('   - Email: nnnn@n');
console.log('   - Password: nnnnnn');
console.log('   - Role: User (NOT Collector)');
console.log('3. Test page reload after login');

// Reload the page
setTimeout(() => {
  console.log('🔄 Auto-refreshing page in 3 seconds...');
  window.location.reload();
}, 3000);
