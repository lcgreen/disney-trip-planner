// Simple script to clear localStorage for testing
// Run this in the browser console to clear the old data

console.log('Clearing localStorage...');
localStorage.removeItem('disney-user');
localStorage.removeItem('disney-widget-configs');
localStorage.removeItem('disney-countdowns');
localStorage.removeItem('disney-budgets');
localStorage.removeItem('disney-packing-lists');
localStorage.removeItem('disney-trip-plans');
console.log('localStorage cleared!');
console.log('Please refresh the page to test the fix.');