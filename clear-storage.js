// This is a utility to clear problematic localStorage data
// Run this in browser console to clear localStorage

console.log('🔧 Clearing localStorage...')

// Show current localStorage
console.log('Current localStorage:', localStorage.getItem('wasteManagementUser'))

// Clear the problematic data
localStorage.removeItem('wasteManagementUser')
localStorage.removeItem('registeredUsers')

console.log('✅ localStorage cleared successfully!')
console.log('Please refresh the page and login again.')

// Check if cleared
console.log('After clearing:', localStorage.getItem('wasteManagementUser'))
