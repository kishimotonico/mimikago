import { eq } from "drizzle-orm";
import { openDb } from "../../src/adapters/real/db.ts";
import { workStates } from "../../src/adapters/real/userSchema.ts";

export interface BusyTimeoutWriteInput {
  catalogPath: string;
  userPath: string;
  workId: string;
}

type WorkerMessage =
  | { type: "ready" }
  | { type: "open"; input: BusyTimeoutWriteInput }
  | { type: "opened" }
  | { type: "write" }
  | { type: "attempting" }
  | { type: "result"; ok: true; elapsedMs: number }
  | { type: "result"; ok: false; elapsedMs: number; message: string };

function post(message: WorkerMessage): void {
  globalThis.postMessage(message);
}

let db: ReturnType<typeof openDb> | undefined;
let workId: string | undefined;

globalThis.onmessage = (
  event: MessageEvent<Extract<WorkerMessage, { type: "open" } | { type: "write" }>>,
) => {
  if (event.data.type === "open") {
    const { catalogPath, userPath } = event.data.input;
    workId = event.data.input.workId;
    db = openDb({ kind: "files", catalogPath, userPath });
    post({ type: "opened" });
    return;
  }
  if (event.data.type !== "write" || db === undefined || workId === undefined) return;
  post({ type: "attempting" });
  const started = performance.now();
  try {
    db.user.update(workStates).set({ bookmarked: true }).where(eq(workStates.workId, workId)).run();
    post({ type: "result", ok: true, elapsedMs: performance.now() - started });
  } catch (error) {
    post({
      type: "result",
      ok: false,
      elapsedMs: performance.now() - started,
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    db.close();
    db = undefined;
    workId = undefined;
  }
};

post({ type: "ready" });
