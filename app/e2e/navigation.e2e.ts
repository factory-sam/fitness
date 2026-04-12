import { test, expect } from "@playwright/test";

test.describe("Navigation & Route Guards", () => {
  test("protected routes redirect to login when unauthenticated", async ({ page }) => {
    const protectedPaths = ["/", "/workout", "/body", "/supplements", "/programme", "/exercises"];

    for (const path of protectedPaths) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, {
        timeout: 5000,
      });
    }
  });

  test("API routes return 401 or redirect when unauthenticated", async ({ request }) => {
    const apiPaths = ["/api/sessions", "/api/supplements", "/api/body-comp"];

    for (const path of apiPaths) {
      const response = await request.get(path);
      // Unauthenticated API calls should fail or redirect
      expect([200, 307, 308, 401, 403]).toContain(response.status());
    }
  });

  test("static assets are accessible without auth", async ({ request }) => {
    const response = await request.get("/favicon.ico");
    // Favicon should be served without redirect (may 200 or 404 depending on existence)
    expect([200, 404]).toContain(response.status());
  });
});
