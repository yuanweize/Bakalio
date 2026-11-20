import { z } from "zod";
export const resultSchema = z.object({
  text: z.string().max(30000),
  evidence: z.array(
    z.object({
      sourceId: z.string(),
      page: z.number().int().positive().optional(),
      quote: z.string(),
    }),
  ),
  simulated: z.boolean(),
  promptVersion: z.literal("research-v1"),
});
export type TaskResult = z.infer<typeof resultSchema>;
export type TaskRequest = {
  task: "outline" | "summarize" | "rewrite" | "sources";
  text: string;
  sources: { id: string; page?: number; text: string }[];
  idempotencyKey: string;
};
export type StreamEvent =
  | { type: "start" }
  | { type: "delta"; text: string }
  | { type: "result"; result: TaskResult }
  | {
      type: "error";
      code: "DISABLED" | "TIMEOUT" | "CANCELLED" | "INVALID_OUTPUT" | "LIMIT";
    };
export interface ProviderAdapter {
  readonly mode: "demo" | "live";
  run(request: TaskRequest, signal: AbortSignal): AsyncIterable<StreamEvent>;
}
export const limits = {
  maxConcurrentPerUser: 1,
  maxDailyTasks: 20,
  maxTokensPerUser: 0,
  timeoutMs: 20000,
  retries: 1,
  promptVersion: "research-v1",
} as const;
export class MockAdapter implements ProviderAdapter {
  readonly mode = "demo" as const;
  async *run(
    req: TaskRequest,
    signal: AbortSignal,
  ): AsyncIterable<StreamEvent> {
    yield { type: "start" };
    if (signal.aborted) {
      yield { type: "error", code: "CANCELLED" };
      return;
    }
    const text =
      req.task === "outline"
        ? "1. Research question\n2. Literature and context\n3. Method and limitations\n4. Findings\n5. Discussion"
        : req.task === "summarize"
          ? "This fictional teaching source explores how familiar campus spaces may contribute to belonging. It is not evidence from a real study."
          : req.task === "rewrite"
            ? "This teaching example examines how everyday campus spaces may shape students’ sense of belonging."
            : "Review the claim about belonging. Add a traceable source and check whether the evidence supports the scope of the claim.";
    yield {
      type: "result",
      result: resultSchema.parse({
        text,
        evidence: [],
        simulated: true,
        promptVersion: "research-v1",
      }),
    };
  }
}
export async function runTask(
  adapter: ProviderAdapter,
  req: TaskRequest,
  signal: AbortSignal,
  onEvent: (e: StreamEvent) => void,
  timeoutMs: number = limits.timeoutMs,
) {
  const combined = AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]);
  for (let attempt = 0; attempt <= limits.retries; attempt++) {
    try {
      const iterator = adapter.run(req, combined)[Symbol.asyncIterator]();
      while (true) {
        const next = await nextOrAbort(iterator, combined);
        if (next.done) break;
        const event = next.value;
        if (combined.aborted) throw new Error("CANCELLED");
        if (event.type === "result") resultSchema.parse(event.result);
        onEvent(event);
      }
      return;
    } catch (e) {
      if (combined.aborted) {
        onEvent({
          type: "error",
          code: signal.aborted ? "CANCELLED" : "TIMEOUT",
        });
        return;
      }
      if (attempt === limits.retries) {
        onEvent({ type: "error", code: "INVALID_OUTPUT" });
        return;
      }
    }
  }
}

// A stalled adapter must not prevent cancellation or timeout delivery.
function nextOrAbort<T>(
  iterator: AsyncIterator<T>,
  signal: AbortSignal,
): Promise<IteratorResult<T>> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      signal.removeEventListener("abort", abort);
      reject(signal.reason);
    };
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    Promise.resolve()
      .then(() => iterator.next())
      .then(
        (result) => {
          signal.removeEventListener("abort", abort);
          resolve(result);
        },
        (error) => {
          signal.removeEventListener("abort", abort);
          reject(error);
        },
      );
  });
}
