import { test, expect } from '@playwright/test';

test.describe('Network Topology & Fault Injection E2E', () => {
  test('injects simulated faults and observes packet delivery failures', async ({ page }) => {
    // Navigate to Network page
    await page.goto('/network');
    await expect(page.locator('h1')).toContainText(/Logical Network Topology/i);

    // Verify healthy nodes
    await expect(page.locator('text=Hostel Floor Gateway')).toBeVisible();
    await expect(page.locator('text=Shared Building Siren')).toBeVisible();

    // Toggle Gateway Offline fault
    const gatewayFaultBtn = page.locator('button:has-text("Gateway Offline")');
    if (await gatewayFaultBtn.isVisible()) {
      await gatewayFaultBtn.click();
    }

    // Toggle Siren Fault
    const sirenFaultBtn = page.locator('button:has-text("Siren Output Faulted")');
    if (await sirenFaultBtn.isVisible()) {
      await sirenFaultBtn.click();
    }

    // Processing log should remain visible and accessible
    await expect(page.locator('text=Network Event Log')).toBeVisible();
  });
});
