import { chromium, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

if (process.env.AI_QUEUE_ISOLATED !== "true")
  throw Error("Run this fixture only against an isolated test database.");
const qa = {
  email: `ai-queue-${Date.now()}@research.test`,
  password: randomBytes(24).toString("base64url"),
};
const base = process.env.RS_BASE || "http://localhost:4320";
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext();
await context.addInitScript(() => localStorage.setItem("rs.locale", "en"));
const page = await context.newPage();
let authorization;
let operations;
page.on("request", (request) => {
  if (request.url().includes("/operations/get-studio")) {
    authorization = request.headers().authorization;
    operations = request.url().split("/operations/")[0] + "/operations/";
  }
});
async function call(kind, data = {}, status = 200) {
  const response = await fetch(operations + "mutate-studio", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body: JSON.stringify({ json: { kind, ...data } }),
  });
  assert.equal(response.status, status, `${kind}: ${response.status}`);
  return (await response.json()).json;
}
async function studio() {
  const response = await fetch(operations + "get-studio", {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization },
    body: JSON.stringify({ json: {} }),
  });
  assert.equal(response.status, 200);
  return (await response.json()).json;
}
async function until(predicate, label) {
  let last;
  for (let attempt = 0; attempt < 40; attempt++) {
    const current = await studio();
    last = current.aiTasks
      .map((job) => ({ id: job.id, status: job.status, error: job.error }))
      .slice(0, 2);
    const result = predicate(current);
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw Error(`Timed out: ${label}; latest jobs: ${JSON.stringify(last)}`);
}

try {
  {
    await page.goto(base + "/signup");
    await page.getByLabel("Email", { exact: true }).fill(qa.email);
    await page.getByLabel("Password", { exact: true }).fill(qa.password);
    await page.locator("form button").click();
    await expect(page.locator("[role=status]")).toBeVisible();
    let link;
    for (let attempt = 0; attempt < 20 && !link; attempt++) {
      const messages = await fetch(
        "http://localhost:8126/api/v1/messages",
      ).then((r) => r.json());
      const message = messages.messages?.find((item) =>
        item.To?.some((recipient) => recipient.Address === qa.email),
      );
      if (message) {
        const detail = await fetch(
          "http://localhost:8126/api/v1/message/" + message.ID,
        ).then((r) => r.json());
        const raw = detail.Text.match(/https?:\/\/[^\s]+/)?.[0];
        if (raw) {
          const target = new URL(raw);
          link = base + target.pathname + target.search;
        }
      } else await new Promise((resolve) => setTimeout(resolve, 500));
    }
    assert.ok(link, "Fixture verification email arrived in local Mailpit");
    await page.goto(link);
    await page.locator("form button").click();
    await expect(page).toHaveURL(base + "/login");
  }
  await page.goto(base + "/login");
  await page.getByLabel("Email", { exact: true }).fill(qa.email);
  await page.getByLabel("Password", { exact: true }).fill(qa.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(base + "/app");
  await studio();
  const initialCalls = (
    await (await fetch("http://127.0.0.1:4399/stats")).json()
  ).calls;
  let project;
  {
    const created = await call("project.create", {
      data: {
        title: "Proposal workflow · fictional QA isolated",
        language: "en",
        thesisType: "Bachelor",
        discipline: "Education",
        question: "How are campus spaces used?",
        method: "Interviews",
        citationStyle: "APA 7",
        targetDate: "",
      },
    });
    const proposal = await call("thesis.proposal", {
      projectId: created.id,
      text: "Title: Fictional campus spaces study\nResearch question: How are campus spaces used?\nMethod: Interviews\nData: Not collected yet",
    });
    const blueprint = await call("thesis.confirm", {
      projectId: created.id,
      version: proposal.version,
      requirements: proposal.requirements,
    });
    await call("thesis.blueprint", {
      projectId: created.id,
      version: blueprint.version,
      structure: blueprint.structure,
    });
    project = (await studio()).projects.find((item) => item.id === created.id);
  }
  assert.ok(project, "Synthetic thesis project exists");
  const section = project.sections.find(
    (item) =>
      ["not_started", "ready"].includes(item.status) && item.kind !== "results",
  );
  assert.ok(section, "Eligible non-results section exists");
  if (section.status === "not_started")
    await call("thesis.status", {
      projectId: project.id,
      id: section.id,
      version: section.version,
      status: "ready",
    });
  const key = crypto.randomUUID();
  await call("ai.section", { sectionId: section.id, key, consent: false }, 400);
  const queued = await call("ai.section", {
    sectionId: section.id,
    key,
    consent: true,
  });
  const duplicate = await call("ai.section", {
    sectionId: section.id,
    key,
    consent: true,
  });
  assert.equal(duplicate.id, queued.id);
  const completed = await until(
    (current) =>
      current.aiTasks.find(
        (job) => job.id === queued.id && job.status === "completed",
      ),
    "PgBoss completed section generation",
  );
  assert.match(completed.output.text, /NEEDS INPUT/);
  assert.equal(completed.inputTokens, 120);
  assert.equal(completed.outputTokens, 30);
  await call("ai.accept", { id: queued.id });
  const accepted = await until(
    (current) =>
      current.aiTasks.find(
        (job) => job.id === queued.id && job.status === "accepted",
      ),
    "accepted result persisted",
  );
  assert.ok(accepted);
  const after = await studio();
  const saved = after.projects
    .find((item) => item.id === project.id)
    .documents.find((item) => item.id === section.documentId);
  assert.match(JSON.stringify(saved.content), /NEEDS INPUT/);
  const comment = await call("review.comment", {
    documentId: saved.id,
    version: saved.version,
    body: "Make this explicit as a fictional teaching example.",
    quote: "A fictional introduction.",
  });
  const revision = await call("ai.section", {
    sectionId: section.id,
    commentId: comment.id,
    key: crypto.randomUUID(),
    consent: true,
  });
  const proposed = await until(
    (current) =>
      current.aiTasks.find(
        (job) => job.id === revision.id && job.status === "completed",
      ),
    "PgBoss completed anchored revision",
  );
  assert.match(proposed.output.text, /clearly fictional/);
  await call("ai.accept", { id: revision.id });
  const revised = await studio();
  const revisedContent = JSON.stringify(
    revised.projects
      .find((item) => item.id === project.id)
      .documents.find((item) => item.id === section.documentId).content,
  );
  assert.match(revisedContent, /clearly fictional/);
  assert.match(revisedContent, /NEEDS INPUT/);
  const stats = await (await fetch("http://127.0.0.1:4399/stats")).json();
  assert.equal(
    stats.calls - initialCalls,
    2,
    "Each unique task made one fixture call",
  );
  const report = {
    passed: [
      "consent gate",
      "idempotent queue submission",
      "PgBoss completion",
      "usage persistence",
      "explicit acceptance",
      "comment revision preserved other text",
    ],
    fixtureCalls: stats.calls - initialCalls,
  };
  await writeFile(
    "../artifacts/thesis/ai-queue.json",
    JSON.stringify(report, null, 2),
  );
  console.log(report);
} finally {
  await browser.close();
}
