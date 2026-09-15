import { expect, test } from '@playwright/test';

test('customer cancels a submitted order through the real system', async ({ page }) => {
  await page.goto('/');

  const submittedOrder = page.locator('[data-order-id="ORD-1002"]');

  await expect(submittedOrder).toBeVisible();

  await submittedOrder.click();

  await expect(page.getByText('Submitted order')).toBeVisible();

  await page.getByRole('button', { name: 'Cancel order' }).click();

  await expect(page.getByText('Cancelled', { exact: true })).toBeVisible();
});
