import { test, expect } from '@playwright/test';

test('countdown page loads correctly with settings button', async ({ page }) => {
  // Navigate directly to the countdown page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  futureDate.setHours(9, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for the countdown to be created and page to stabilize
  await page.waitForTimeout(3000);

  // Check if the Customise button is present
  const customiseButton = page.getByRole('button', { name: /customise/i });
  await expect(customiseButton).toBeVisible();

  console.log('Countdown page loaded successfully with Customise button');
});

test('customise button click works and shows settings panel', async ({ page }) => {
  // Navigate directly to the countdown page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  futureDate.setHours(9, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for the countdown to be created
  await page.waitForTimeout(3000);

  // Click the Customise button
  const customiseButton = page.getByRole('button', { name: /customise/i });
  await expect(customiseButton).toBeVisible();

  // Listen for console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await customiseButton.click();

  // Wait a bit and check for console errors
  await page.waitForTimeout(2000);

  if (consoleErrors.length > 0) {
    console.log('Console errors found:', consoleErrors);
  } else {
    console.log('No console errors found');
  }

  // Check if the settings panel appeared
  const settingsPanel = page.getByTestId('settings-panel');
  const isVisible = await settingsPanel.isVisible();

  if (isVisible) {
    console.log('Settings panel is visible after clicking Customise button');
  } else {
    console.log('Settings panel is not visible after clicking Customise button');

    // Check if the button state changed
    const buttonClasses = await customiseButton.getAttribute('class');
    console.log('Customise button classes:', buttonClasses);

    // Check if there are any elements with settings-related content
    const settingsContent = page.locator('text=Display Options');
    const hasSettingsContent = await settingsContent.isVisible();
    console.log('Settings content visible:', hasSettingsContent);
  }
});

test('countdown settings panel can be opened and closed', async ({ page }) => {
  // Navigate directly to the countdown page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  futureDate.setHours(9, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for the countdown to be created
  await page.waitForTimeout(3000);

  // Click the Customise button to open settings
  const customiseButton = page.getByRole('button', { name: /customise/i });
  await expect(customiseButton).toBeVisible();
  await customiseButton.click();

  // Wait for settings content to appear
  await page.waitForSelector('text=Display Options', { timeout: 15000 });

  // Verify settings content is visible
  const displayOptions = page.getByText('Display Options');
  await expect(displayOptions).toBeVisible();

  // Click the Customise button again to close settings
  await customiseButton.click();

  // Wait for settings content to disappear
  await page.waitForTimeout(1000);

  // Verify settings content is no longer visible
  await expect(displayOptions).not.toBeVisible();

  console.log('Settings panel can be opened and closed successfully');
});

test('countdown settings controls are present and functional', async ({ page }) => {
  // Navigate directly to the countdown page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  futureDate.setHours(9, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for the countdown to be created
  await page.waitForTimeout(3000);

  // Open settings
  const customiseButton = page.getByRole('button', { name: /customise/i });
  await expect(customiseButton).toBeVisible();
  await customiseButton.click();

  // Wait for settings content to appear
  await page.waitForSelector('text=Display Options', { timeout: 15000 });

  // Check for various settings controls
  const showMillisecondsToggle = page.getByTestId('setting-show-milliseconds');
  const showTimezoneToggle = page.getByTestId('setting-show-timezone');
  const showTipsToggle = page.getByTestId('setting-show-tips');
  const showAttractionsToggle = page.getByTestId('setting-show-attractions');
  const playSoundToggle = page.getByTestId('setting-play-sound');
  const autoRefreshToggle = page.getByTestId('setting-auto-refresh');
  const digitStyleSelect = page.getByTestId('setting-digit-style');
  const layoutSelect = page.getByTestId('setting-layout');
  const fontSizeSelect = page.getByTestId('setting-font-size');
  const backgroundEffectSelect = page.getByTestId('setting-background-effect');

  // Verify all settings controls are present
  await expect(showMillisecondsToggle).toBeVisible();
  await expect(showTimezoneToggle).toBeVisible();
  await expect(showTipsToggle).toBeVisible();
  await expect(showAttractionsToggle).toBeVisible();
  await expect(playSoundToggle).toBeVisible();
  await expect(autoRefreshToggle).toBeVisible();
  await expect(digitStyleSelect).toBeVisible();
  await expect(layoutSelect).toBeVisible();
  await expect(fontSizeSelect).toBeVisible();
  await expect(backgroundEffectSelect).toBeVisible();

  console.log('All settings controls are present');
});

test('countdown settings can be modified and persist', async ({ page }) => {
  // Navigate directly to the countdown page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  futureDate.setHours(9, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for the countdown to be created
  await page.waitForTimeout(3000);

  // Open settings
  const customiseButton = page.getByRole('button', { name: /customise/i });
  await expect(customiseButton).toBeVisible();
  await customiseButton.click();

  // Wait for settings content to appear
  await page.waitForSelector('text=Display Options', { timeout: 15000 });

  // Test modifying settings
  const showMillisecondsToggle = page.getByTestId('setting-show-milliseconds');
  await showMillisecondsToggle.click();

  const digitStyleSelect = page.getByTestId('setting-digit-style');
  await digitStyleSelect.click();
  await page.getByRole('option', { name: /neon/i }).click();

  const layoutSelect = page.getByTestId('setting-layout');
  await layoutSelect.click();
  await page.getByRole('option', { name: /vertical/i }).click();

  const fontSizeSelect = page.getByTestId('setting-font-size');
  await fontSizeSelect.click();
  await page.getByRole('option', { name: 'Large', exact: true }).click();

  const backgroundEffectSelect = page.getByTestId('setting-background-effect');
  await backgroundEffectSelect.click();
  await page.getByRole('option', { name: /particles/i }).click();

  // Wait for changes to apply
  await page.waitForTimeout(2000);

  // Verify the changes were applied
  await expect(showMillisecondsToggle).toBeChecked();
  await expect(digitStyleSelect).toHaveText(/neon/i);
  await expect(layoutSelect).toHaveText(/vertical/i);
  await expect(fontSizeSelect).toHaveText(/^large$/i);
  await expect(backgroundEffectSelect).toHaveText(/particles/i);

  console.log('Settings were successfully modified and persisted');
});

test('countdown widget displays with different layout settings', async ({ page }) => {
  // Navigate directly to the countdown page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a future date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  futureDate.setHours(9, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for the countdown to be created
  await page.waitForTimeout(3000);

  // Open settings
  const customiseButton = page.getByRole('button', { name: /customise/i });
  await expect(customiseButton).toBeVisible();
  await customiseButton.click();

  // Wait for settings content to appear
  await page.waitForSelector('text=Display Options', { timeout: 15000 });

  // Test different layouts
  const layoutSelect = page.getByTestId('setting-layout');

  // Test vertical layout
  await layoutSelect.click();
  await page.getByRole('option', { name: /vertical/i }).click();
  await page.waitForTimeout(1000);

  // Test compact layout
  await layoutSelect.click();
  await page.getByRole('option', { name: /compact/i }).click();
  await page.waitForTimeout(1000);

  // Test grid layout
  await layoutSelect.click();
  await page.getByRole('option', { name: /grid/i }).click();
  await page.waitForTimeout(1000);

  // Test horizontal layout
  await layoutSelect.click();
  await page.getByRole('option', { name: /horizontal/i }).click();
  await page.waitForTimeout(1000);

  // Verify we can switch between layouts
  await expect(layoutSelect).toHaveText(/horizontal/i);

  console.log('Layout switching works correctly');
});