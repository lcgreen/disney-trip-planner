// Test script to verify anonymous users cannot save data
// Run this in the browser console on the test page

console.log('🧪 Testing Anonymous User Save Restrictions...');

// Test 1: Check if user is anonymous
const { userManager } = await import('/src/lib/userManagement.ts');
const currentUser = userManager.getCurrentUser();
console.log('Current user:', currentUser);

// Test 2: Check save permissions
const hasSaveAccess = userManager.hasFeatureAccess('saveData');
console.log('Has save access:', hasSaveAccess);

// Test 3: Try to save data directly
console.log('Attempting to save countdown data...');
try {
  const testData = {
    id: 'test-countdown',
    name: 'Test Countdown',
    date: new Date().toISOString(),
    park: { name: 'Test Park' }
  };

  // This should be blocked for anonymous users
  localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: [testData] }));
  console.log('❌ Direct localStorage save succeeded (should be blocked)');
} catch (error) {
  console.log('✅ Direct localStorage save blocked:', error.message);
}

// Test 4: Try to save via PluginStorage
console.log('Attempting to save via PluginStorage...');
try {
  const { PluginStorage } = await import('/src/lib/pluginSystem.ts');
  await PluginStorage.saveData('test-key', { test: 'data' });
  console.log('❌ PluginStorage save succeeded (should be blocked)');
} catch (error) {
  console.log('✅ PluginStorage save blocked:', error.message);
}

// Test 5: Try to save via AutoSaveService
console.log('Attempting to save via AutoSaveService...');
try {
  const { AutoSaveService } = await import('/src/lib/autoSaveService.ts');
  await AutoSaveService.saveCountdownData({
    id: 'test-auto-save',
    name: 'Test Auto Save',
    park: { name: 'Test Park' },
    date: new Date().toISOString(),
    settings: {},
    createdAt: new Date().toISOString()
  });
  console.log('❌ AutoSaveService save succeeded (should be blocked)');
} catch (error) {
  console.log('✅ AutoSaveService save blocked:', error.message);
}

// Test 6: Try to save via WidgetConfigManager
console.log('Attempting to save via WidgetConfigManager...');
try {
  const { WidgetConfigManager } = await import('/src/lib/widgetConfig.ts');
  await WidgetConfigManager.saveCurrentCountdownState(new Date().toISOString(), 'Test', { name: 'Test Park' });
  console.log('❌ WidgetConfigManager save succeeded (should be blocked)');
} catch (error) {
  console.log('✅ WidgetConfigManager save blocked:', error.message);
}

console.log('🧪 Anonymous user save restriction test completed!');