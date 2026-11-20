import { chromium, expect } from "@playwright/test";
const base = process.env.RS_BASE || "https://bakalio.eurun.eu.org";
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const lang of ["en", "cs", "zh"]) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/" + lang, { waitUntil: "networkidle" });
    const primary = page.locator(".hero-actions .btn.primary");
    await expect(primary).toHaveAttribute("href", "/demo?view=studio");
    await primary.click();
    await expect(page).toHaveURL(/\/demo\?view=studio$/);
    await expect(page.locator(".demo-guided-page .thesis-demo")).toBeVisible();
    await page.locator(".demo-guided-page .thesis-demo-stepbar button").nth(1).click();
    await expect(page.locator(".demo-guided-page .thesis-demo-chapter-cards li")).toHaveCount(6);
    await page.locator(".demo-guided-next a").click();
    await expect(page).toHaveURL(/\/demo$/);
    await expect(page.locator(".tiptap")).toBeVisible();
    if (errors.length) throw new Error(lang + " errors: " + errors.join(","));
    await page.close();
  }
  console.log("Landing → guided studio → editable sandbox works in cs/en/zh; no page exceptions");
} finally { await browser.close(); }
