import { test, expect } from '@playwright/test';

test('countdown date editing and persistence', async ({ page }) => {
  // Navigate directly to countdown creation page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set initial date (30 days from now)
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() + 30);
  initialDate.setHours(9, 0, 0, 0);
  const initialDateString = initialDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(initialDateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for countdown to be created and displayed
  await page.waitForTimeout(3000);

  // Verify countdown is displayed
  const countdownDisplay = page.locator('[data-testid="countdown-timer-container"]');
  await expect(countdownDisplay).toBeVisible();

  // Wait for the active timer to appear
  const activeTimer = page.locator('[data-testid="countdown-timer-active"]');
  await expect(activeTimer).toBeVisible();

  // Get initial countdown values
  const initialDays = await page.locator('[data-testid="countdown-days-value"]').textContent();
  console.log('Initial days:', initialDays);

  // Now change the date to a different value (60 days from now)
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + 60);
  newDate.setHours(14, 30, 0, 0); // Different time too
  const newDateString = newDate.toISOString().slice(0, 16);

  // Clear and set new date
  await dateInput.clear();
  await dateInput.fill(newDateString);

  // Wait for auto-save to trigger and countdown to update
  await page.waitForTimeout(3000);

  // Verify the countdown display updated
  const newDays = await page.locator('[data-testid="countdown-days-value"]').textContent();
  console.log('New days:', newDays);

  // The new countdown should show more days than the initial one
  expect(parseInt(newDays || '0')).toBeGreaterThan(parseInt(initialDays || '0'));

  // Verify the date input still shows the new value
  await expect(dateInput).toHaveValue(newDateString);

  console.log('Date editing and persistence test completed successfully');
});

test('countdown time editing and persistence', async ({ page }) => {
  // Navigate directly to countdown creation page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set initial date and time
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() + 25);
  initialDate.setHours(9, 0, 0, 0);
  const initialDateString = initialDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(initialDateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for countdown to be created
  await page.waitForTimeout(3000);

  // Wait for the active timer to appear
  const activeTimer = page.locator('[data-testid="countdown-timer-active"]');
  await expect(activeTimer).toBeVisible();

  // Get initial countdown values
  const initialHours = await page.locator('[data-testid="countdown-hours-value"]').textContent();
  console.log('Initial hours:', initialHours);

  // Change the time to a different hour
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + 25);
  newDate.setHours(15, 30, 0, 0); // Different time: 3:30 PM
  const newDateString = newDate.toISOString().slice(0, 16);

  // Clear and set new date/time
  await dateInput.clear();
  await dateInput.fill(newDateString);

  // Wait for auto-save to trigger
  await page.waitForTimeout(3000);

  // Get new countdown values
  const newHours = await page.locator('[data-testid="countdown-hours-value"]').textContent();
  console.log('New hours:', newHours);

  // The hours should be different due to the time change
  expect(newHours).not.toBe(initialHours);

  // Verify the date input shows the new value
  await expect(dateInput).toHaveValue(newDateString);

  console.log('Time editing and persistence test completed successfully');
});

test('countdown theme application and persistence', async ({ page }) => {
  // Navigate directly to countdown creation page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 45);
  futureDate.setHours(10, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for countdown to be created
  await page.waitForTimeout(3000);

  // Open settings
  const customiseButton = page.getByRole('button', { name: /customise/i });
  await expect(customiseButton).toBeVisible();
  await customiseButton.click();

  // Wait for settings content to appear
  await page.waitForSelector('text=Display Options', { timeout: 15000 });

  // Change theme-related settings
  const digitStyleSelect = page.getByTestId('setting-digit-style');
  await digitStyleSelect.click();
  await page.getByRole('option', { name: /neon/i }).click();

  const backgroundEffectSelect = page.getByTestId('setting-background-effect');
  await backgroundEffectSelect.click();
  await page.getByRole('option', { name: /particles/i }).click();

  // Wait for changes to apply
  await page.waitForTimeout(2000);

  // Verify settings were applied
  await expect(digitStyleSelect).toHaveText(/neon/i);
  await expect(backgroundEffectSelect).toHaveText(/particles/i);

  // Check if the countdown display reflects the theme changes
  const countdownDisplay = page.locator('[data-testid="countdown-timer-container"]');
  await expect(countdownDisplay).toBeVisible();

  // Close settings
  await customiseButton.click();
  await page.waitForTimeout(1000);

  // Reopen settings to verify persistence
  await customiseButton.click();
  await page.waitForSelector('text=Display Options', { timeout: 15000 });

  // Verify settings are still applied
  await expect(digitStyleSelect).toHaveText(/neon/i);
  await expect(backgroundEffectSelect).toHaveText(/particles/i);

  console.log('Theme application and persistence test completed successfully');
});

test('countdown layout changes and persistence', async ({ page }) => {
  // Navigate directly to countdown creation page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set a date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 40);
  futureDate.setHours(11, 0, 0, 0);
  const dateString = futureDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(dateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for countdown to be created
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

  // Verify vertical layout is applied
  await expect(layoutSelect).toHaveText(/vertical/i);

  // Test compact layout
  await layoutSelect.click();
  await page.getByRole('option', { name: /compact/i }).click();
  await page.waitForTimeout(1000);

  // Verify compact layout is applied
  await expect(layoutSelect).toHaveText(/compact/i);

  // Test grid layout
  await layoutSelect.click();
  await page.getByRole('option', { name: /grid/i }).click();
  await page.waitForTimeout(1000);

  // Verify grid layout is applied
  await expect(layoutSelect).toHaveText(/grid/i);

  // Close settings
  await customiseButton.click();
  await page.waitForTimeout(1000);

  // Reopen settings to verify persistence
  await customiseButton.click();
  await page.waitForSelector('text=Display Options', { timeout: 15000 });

  // Verify grid layout is still applied
  await expect(layoutSelect).toHaveText(/grid/i);

  console.log('Layout changes and persistence test completed successfully');
});

test('countdown auto-save functionality', async ({ page }) => {
  // Navigate directly to countdown creation page
  await page.goto('http://localhost:3000/countdown/new');
  await page.waitForSelector('input[type="datetime-local"]');

  // Set initial date
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() + 35);
  initialDate.setHours(12, 0, 0, 0);
  const initialDateString = initialDate.toISOString().slice(0, 16);

  const dateInput = page.getByLabel(/select your disney trip date and time/i);
  await expect(dateInput).toBeVisible();
  await dateInput.fill(initialDateString);

  // Select a park
  const disneyWorldButton = page.locator('button').filter({ hasText: 'Disney World' });
  await expect(disneyWorldButton).toBeVisible();
  await disneyWorldButton.click();

  // Wait for countdown to be created
  await page.waitForTimeout(3000);

  // Wait for the active timer to appear
  const activeTimer = page.locator('[data-testid="countdown-timer-active"]');
  await expect(activeTimer).toBeVisible();

  // Verify countdown is displayed
  const countdownDisplay = page.locator('[data-testid="countdown-timer-container"]');
  await expect(countdownDisplay).toBeVisible();

  // Get initial countdown values
  const initialDays = await page.locator('[data-testid="countdown-days-value"]').textContent();
  console.log('Initial days:', initialDays);

  // Make multiple rapid changes to test auto-save
  const dates = [
    new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), // 40 days
    new Date(Date.now() + 50 * 24 * 60 * 60 * 1000), // 50 days
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
  ];

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    date.setHours(10 + i, 30, 0, 0); // Different times
    const dateString = date.toISOString().slice(0, 16);

    await dateInput.clear();
    await dateInput.fill(dateString);

    // Wait a bit for auto-save
    await page.waitForTimeout(1000);
  }

  // Wait for final auto-save
  await page.waitForTimeout(2000);

  // Verify the final countdown is displayed
  const finalDays = await page.locator('[data-testid="countdown-days-value"]').textContent();
  console.log('Final days:', finalDays);

  // Should show a countdown (not 0)
  expect(parseInt(finalDays || '0')).toBeGreaterThan(0);

  // Verify the date input shows the final value
  const finalDate = dates[dates.length - 1];
  const finalDateString = finalDate.toISOString().slice(0, 16);
  await expect(dateInput).toHaveValue(finalDateString);

  console.log('Auto-save functionality test completed successfully');
});