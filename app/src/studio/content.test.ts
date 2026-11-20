import { describe, it, expect } from "vitest";
import { validateContent, markdownOf, textOf, wordCount } from "./content";
import { demoContent } from "./demo";
import { MockAdapter, runTask } from "../ai/provider";
describe("manuscript portability and safety", () => {
  it("exports headings and bound citation labels", () => {
    validateContent(demoContent);
    expect(markdownOf(demoContent)).toContain("# Learning");
    expect(markdownOf(demoContent)).toContain("[Novák, 2025, p. 12]");
    expect(textOf(demoContent)).toContain("fictional");
  });
  it("rejects executable links and unsupported content", () => {
    expect(() =>
      validateContent({
        type: "text",
        text: "x",
        marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
      }),
    ).toThrow();
    expect(() => validateContent({ type: "script" })).toThrow();
  });
  it("counts Chinese characters and Czech words", () => {
    expect(wordCount({ type: "text", text: "研究 Český výzkum" })).toBe(4);
  });
  it("marks simulated results and respects cancellation", async () => {
    const events: any[] = [];
    const req = {
      task: "outline" as const,
      text: "",
      sources: [],
      idempotencyKey: "x",
    };
    await runTask(new MockAdapter(), req, new AbortController().signal, (e) =>
      events.push(e),
    );
    expect(events.at(-1).result.simulated).toBe(true);
    const abort = new AbortController();
    abort.abort();
    const cancelled: any[] = [];
    await runTask(new MockAdapter(), req, abort.signal, (e) =>
      cancelled.push(e),
    );
    expect(cancelled.at(-1).code).toBe("CANCELLED");
  });
});

it("times out and cancels even when a provider stalls", async () => {
  const adapter = {
    mode: "demo" as const,
    async *run(): AsyncIterable<any> {
      await new Promise(() => {});
    },
  };
  const req = {
    task: "outline" as const,
    text: "",
    sources: [],
    idempotencyKey: "stall",
  };
  const events: any[] = [];
  await runTask(
    adapter,
    req,
    new AbortController().signal,
    (e) => events.push(e),
    10,
  );
  expect(events).toEqual([{ type: "error", code: "TIMEOUT" }]);
  const controller = new AbortController();
  const pending = runTask(adapter, req, controller.signal, (e) =>
    events.push(e),
  );
  controller.abort();
  await pending;
  expect(events.at(-1).code).toBe("CANCELLED");
});
