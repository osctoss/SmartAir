import { test, expect } from '@playwright/test';

test.describe('Settings & Workspace Persistence E2E', () => {
  test('navigates to settings, toggles reduce motion, and tests resets', async ({ page }) => {
    // Navigate to Settings page
    await page.goto('/settings');
    await expect(page.locator('h1')).toContainText(/Settings & Workspace Data/i);

    // Toggle Reduce Motion
    const reduceMotionSwitch = page.locator('button[role="switch"]');
    await reduceMotionSwitch.click();

    // Verify root HTML element has reduce-motion class
    await expect(page.locator('html')).toHaveClass(/reduce-motion/);

    // Verify storage indicators
    await expect(page.locator('text=Browser LocalStorage')).toBeVisible();

    // Verify Presets button launches Presets modal
    await page.click('button:has-text("Browse 11 Scenario Presets")');
    await expect(page.locator('text=Preset Scenarios & Interactive Demos')).toBeVisible();
    await page.click('button:has-text("Cancel")');

    // Scoped clear active alerts
    await page.click('button:has-text("Clear Active Alerts")');
    await expect(page.locator('text=Clear Active Alerts?')).toBeVisible();
    await page.click('button:has-text("Cancel")');
  });
});
