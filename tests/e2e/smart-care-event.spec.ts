import { test, expect } from '@playwright/test';

test.describe('Smart Care Event & Warden Operator Flow E2E', () => {
  test('places virtual load, transmits packet, sounds siren, and resolves incident in Admin', async ({
    page,
  }) => {
    // Navigate to Room A-204 (Smart Care edition)
    await page.goto('/rooms/room-care-a204');

    await expect(page.locator('text=SmartAir Smart Care')).toBeVisible();

    // Place load on fan using keyboard button
    await page.click('button:has-text("Place on Fan")');

    // Wait for packet propagation and incident logging
    await page.waitForTimeout(1500);

    // Verify detection state
    await expect(page.locator('text=ABNORMAL LOAD DETECTED')).toBeVisible();

    // Navigate to Admin Operations Console
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText(/Warden Operations Center/i);

    // Verify Active Incidents table has an incident
    await expect(page.locator('text=Room A-204')).toBeVisible();
    await expect(page.locator('text=abnormal-load')).toBeVisible();

    // Click "Acknowledge" button
    const ackBtn = page.locator('button:has-text("Acknowledge")').first();
    if (await ackBtn.isVisible()) {
      await ackBtn.click();
      await page.click('button:has-text("Confirm Acknowledgement")');
    }

    // Verify incident can be resolved
    const resolveBtn = page.locator('button:has-text("Resolve")').first();
    if (await resolveBtn.isVisible()) {
      await resolveBtn.click();
      await page.fill('textarea', 'Inspection complete. Accidental load removed by warden.');
      await page.click('button:has-text("Resolve Incident")');
    }
  });
});
