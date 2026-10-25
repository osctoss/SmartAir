import { test, expect } from '@playwright/test';

test.describe('Room Creation & Registry E2E Flow', () => {
  test('creates a new Smart Home room and opens its simulator', async ({ page }) => {
    await page.goto('/rooms');

    // Verify rooms registry page loaded
    await expect(page.locator('h1')).toContainText(/Room Registry/i);

    // Click "Add Room" button
    await page.click('text=Add Room');
    await expect(page).toHaveURL('/rooms/new');

    // Step 1: Room Identity
    await page.fill('input[placeholder*="Room A-205"]', 'Studio Suite 501');
    await page.fill('input[placeholder="room-a205"]', 'room-suite-501');
    await page.click('button:has-text("Continue")');

    // Step 2: Commercial Edition Selection
    await expect(page.locator('text=Commercial Edition')).toBeVisible();
    await page.click('button:has-text("SmartAir Smart Home")');
    await page.click('button:has-text("Continue")');

    // Step 3: Hardware & Comfort Configuration
    await expect(page.locator('text=Cooling Configuration')).toBeVisible();
    await page.click('button:has-text("Continue")');

    // Step 4: Review & Create
    await expect(page.locator('text=Ready to Provision Room')).toBeVisible();
    await page.click('button:has-text("Provision Room")');

    // Should redirect to rooms list or simulator and show the new room
    await expect(page).toHaveURL(/\/rooms/);
    await expect(page.locator('text=Studio Suite 501')).toBeVisible();
  });
});
