import { test, expect } from "@playwright/test";

test("redirects unauthenticated users from dashboard to login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/.*login/);
});

test("login page renders correctly", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Tasting Night")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  await expect(page.getByText("Sign up")).toBeVisible();
});

test("signup page renders correctly", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByText("Create Account")).toBeVisible();
  await expect(page.getByLabel("Username")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create account" })
  ).toBeVisible();
});

test("can navigate between login and signup", async ({ page }) => {
  await page.goto("/login");
  await page.getByText("Sign up").click();
  await expect(page).toHaveURL(/.*signup/);
  await page.getByText("Sign in").click();
  await expect(page).toHaveURL(/.*login/);
});
