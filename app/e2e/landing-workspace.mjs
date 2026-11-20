import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const base = process.env.RS_BASE || "http://127.0.0.1:4335";
const browser = await chromium.launch({ channel: "chrome" });
const output = resolve("../artifacts/thesis/landing-v2");
await mkdir(output, { recursive: true });
const results = [];
try {
  for (const lang of ["en", "cs", "zh"]) {
    for (const width of [390, 768, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        colorScheme: "light",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base + "/" + lang + "/", { waitUntil: "networkidle" });
      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        demoWidth: Math.round(document.querySelector(".thesis-demo")?.getBoundingClientRect().width || 0),
      }));
      if (layout.scrollWidth > layout.clientWidth + 1) {
        throw new Error("Horizontal overflow " + lang + "/" + width + ": " + JSON.stringify(layout));
      }
      if (errors.length) throw new Error("Page error " + lang + "/" + width + ": " + errors.join(","));
      if (!layout.demoWidth) throw new Error("Demo missing at " + lang + "/" + width);
      if ((lang === "en" || lang === "zh") && (width === 390 || width === 1440)) {
        await page.screenshot({ path: output + "/" + lang + "-" + width + ".png", fullPage: false });
      }
      results.push({ lang, width, ...layout, errors });
      await page.close();
    }
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(base + "/en/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Build example blueprint" }).click();
  const chapters = page.locator(".thesis-demo-chapter-cards button");
  if (await chapters.count() !== 6) throw new Error("Missing blueprint chapters");
  await chapters.nth(0).click();
  await page.getByRole("button", { name: "Load example draft" }).click();
  await page.getByRole("textbox", { name: "Section", exact: true }).fill("Custom chapter-one draft");
  await page.getByLabel("Choose a section").selectOption("literature");
  await page.getByRole("button", { name: "Load example draft" }).click();
  await page.getByLabel("Choose a section").selectOption("introduction");
  const restored = await page.getByRole("textbox", { name: "Section", exact: true }).inputValue();
  if (restored !== "Custom chapter-one draft") throw new Error("Chapter draft lost on switch");
  await page.getByLabel("Research type", { exact: true }).selectOption("kpm-slide");
  const template = page.locator(".templates-explorer");
  if (await template.locator("li").count() !== 7) throw new Error("Seven KPM chapters missing");
  if (!(await template.getByText("not been independently verified").isVisible())) throw new Error("Source caveat missing");
  await page.close();
  console.log(JSON.stringify({ passed: true, widths: results, chapterPersistence: true, sevenChapterReference: true }, null, 2));
} finally {
  await browser.close();
}
