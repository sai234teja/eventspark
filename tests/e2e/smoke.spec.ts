import { test, expect } from '@playwright/test';

test.describe('EventSpark Smoke Tests', () => {
  
  test('1. Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    // Should have some generic text or heading expected on the homepage
    await expect(page).toHaveTitle(/EventSpark|Home/i);
  });

  test('2. Authentication page loads', async ({ page }) => {
    await page.goto('/login');
    // Expect the login form to be visible
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In|Log In/i })).toBeVisible();
  });

  test('3. Event discovery loads', async ({ page }) => {
    await page.goto('/events');
    // Search or events list should be visible
    await expect(page.getByPlaceholder(/Search/i).first()).toBeVisible();
  });

  test('4. Unauthorized organizer/admin access is rejected', async ({ page }) => {
    // Assuming unauthenticated users are redirected or shown an error
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login.*/);
    
    await page.goto('/organizer/dashboard');
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test('5. Organizer application page loads', async ({ page }) => {
    // Usually behind login, but let's check if the route redirects correctly if unauthenticated
    await page.goto('/organizer/register');
    await expect(page).toHaveURL(/.*\/login.*/);
  });

});
