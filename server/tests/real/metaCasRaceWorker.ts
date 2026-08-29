import { patchMetaFileCas } from "../../src/adapters/real/meta.ts";

export type MetaCasRacePatch = { title?: string; tags?: string[] };

export type MetaCasRaceInput = {
  metaPath: string;
  expectedSourceRevision: string;
  patch: MetaCasRacePatch;
  gate: SharedArrayBuffer;
};

type WorkerMessage =
  | { type: "ready" }
  | { type: "run"; input: MetaCasRaceInput }
  | { type: "done"; ok: true; elapsedMs: number }
  | { type: "done"; ok: false; elapsedMs: number; errorName: string; message: string };

function post(message: WorkerMessage): void {
  globalThis.postMessage(message);
}

globalThis.onmessage = (event: MessageEvent<Extract<WorkerMessage, { type: "run" }>>) => {
  if (event.data.type !== "run") return;
  const { metaPath, expectedSourceRevision, patch, gate } = event.data.input;
  const flags = new Int32Array(gate);
  Atomics.add(flags, 1, 1);
  Atomics.notify(flags, 1);
  Atomics.wait(flags, 0, 0);
  const started = performance.now();
  try {
    patchMetaFileCas(metaPath, expectedSourceRevision, patch);
    post({ type: "done", ok: true, elapsedMs: performance.now() - started });
  } catch (error) {
    post({
      type: "done",
      ok: false,
      elapsedMs: performance.now() - started,
      errorName: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

post({ type: "ready" });
