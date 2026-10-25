import { test, expect } from '@playwright/test';

test.describe('Smart Home Scenario & Energy Lab E2E Flow', () => {
  test('simulates thermal conditions and views Energy Lab comparison', async ({ page }) => {
    // Open Smart Home Room H-301
    await page.goto('/rooms/room-home-h301');

    await expect(page.locator('text=SmartAir Smart Home')).toBeVisible();
    await expect(page.locator('text=Comfort Index')).toBeVisible();

    // Toggle Quiet Mode
    const quietModeBtn = page.locator('button[role="switch"]');
    if (await quietModeBtn.isVisible()) {
      await quietModeBtn.click();
    }

    // Advance simulation time
    await page.click('button:has-text("+1 Min")');

    // Navigate to Energy Lab
    await page.goto('/energy-lab');
    await expect(page.locator('h1')).toContainText(/Energy Lab/i);

    // Verify benchmark controls and comparative cards
    await expect(page.locator('text=Conventional Baseline')).toBeVisible();
    await expect(page.locator('text=SmartAir Coordinated')).toBeVisible();
    await expect(page.locator('text=Run 24h Scenario Comparison')).toBeVisible();

    // Run 24h scenario
    await page.click('button:has-text("Run 24h Scenario Comparison")');
    await expect(page.locator('text=Modeled Energy Comparison')).toBeVisible();
  });
});
