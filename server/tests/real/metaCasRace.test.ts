import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { emptyDlsiteState } from "@mimimilli/shared";
import { sourceRevision } from "../../src/adapters/real/meta.ts";
import { makeTestDirectory } from "../helpers/sampleLibrary.ts";
import type { MetaCasRaceInput, MetaCasRacePatch } from "./metaCasRaceWorker.ts";

type WorkerDone =
  | { ok: true; elapsedMs: number }
  | { ok: false; elapsedMs: number; errorName: string; message: string };

const TITLE_PATCH: MetaCasRacePatch = { title: "並行書き込みA" };
const TAGS_PATCH: MetaCasRacePatch = { tags: ["race-tag"] };

function workerFailureError(phase: string, event: Event): Error {
  const { message, filename, lineno, colno, error } = event as ErrorEvent;
  const detail = error ?? new Error(message);
  const location = filename ? ` (${filename}:${lineno}:${colno})` : "";
  const stack = detail.stack ?? (message !== detail.message ? message : undefined);
  const body = stack ? `${detail.message}\n${stack}` : detail.message;
  return new Error(`Worker failed to ${phase}${location}: ${body}`);
}

function waitForWorkerMessage<T extends { type: string }>(
  worker: Worker,
  type: string,
  phase: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<{ type: string }>) => {
      if (event.data.type !== type) return;
      worker.removeEventListener("message", onMessage);
      resolve(event.data as T);
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", (event) => reject(workerFailureError(phase, event)));
  });
}

function writeSampleMeta(metaPath: string): Buffer {
  const bytes = Buffer.from(
    `${JSON.stringify(
      {
        formatVersion: 1,
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        title: "元のタイトル",
        urls: [],
        tags: [],
        coverImage: null,
        playlists: [],
        defaultPlaylistId: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        dlsite: emptyDlsiteState(),
      },
      null,
      2,
    )}\n`,
    "utf-8",
  );
  writeFileSync(metaPath, bytes);
  return bytes;
}

async function runConcurrentPatches(
  metaPath: string,
  expectedSourceRevision: string,
): Promise<[WorkerDone, WorkerDone]> {
  const gate = new SharedArrayBuffer(8);
  const flags = new Int32Array(gate);
  const workers = [0, 1].map(
    () =>
      new Worker(new URL("./metaCasRaceWorker.ts", import.meta.url), {
        type: "module",
      }),
  );
  try {
    await Promise.all(workers.map((worker) => waitForWorkerMessage(worker, "ready", "start")));
    const done = workers.map((worker) =>
      waitForWorkerMessage<WorkerDone & { type: "done" }>(worker, "done", "patch"),
    );
    const inputs: MetaCasRaceInput[] = [
      { metaPath, expectedSourceRevision, patch: TITLE_PATCH, gate },
      { metaPath, expectedSourceRevision, patch: TAGS_PATCH, gate },
    ];
    for (const [index, worker] of workers.entries()) {
      worker.postMessage({ type: "run", input: inputs[index] });
    }
    while (Atomics.load(flags, 1) < 2) {
      Atomics.wait(flags, 1, Atomics.load(flags, 1), 100);
    }
    Atomics.store(flags, 0, 1);
    Atomics.notify(flags, 0, 2);
    const results = await Promise.all(done);
    assert.equal(results.length, 2);
    return [results[0]!, results[1]!];
  } finally {
    for (const worker of workers) worker.terminate();
  }
}

function assertSingleCompleteWrite(metaPath: string, results: [WorkerDone, WorkerDone]): void {
  const meta = JSON.parse(readFileSync(metaPath, "utf-8")) as {
    title: string;
    tags: string[];
  };
  const titleApplied = meta.title === TITLE_PATCH.title;
  const tagsApplied = meta.tags.length === 1 && meta.tags[0] === TAGS_PATCH.tags?.[0];
  const successes = results.filter((result) => result.ok);
  const sourceChanged = results.filter(
    (result) => !result.ok && result.errorName === "SourceChangedError",
  );
  assert.equal(successes.length, 1);
  assert.equal(sourceChanged.length, 1);
  assert.equal(titleApplied, !tagsApplied);
  assert.equal(existsSync(join(dirname(metaPath), `.${basename(metaPath)}.lock`)), false);
}

async function withCasDelay<T>(delayMs: number, fn: () => Promise<T>): Promise<T> {
  const previous = process.env.MIMIMILLI_ATOMIC_WRITE_CAS_DELAY_MS;
  if (delayMs > 0) process.env.MIMIMILLI_ATOMIC_WRITE_CAS_DELAY_MS = String(delayMs);
  else delete process.env.MIMIMILLI_ATOMIC_WRITE_CAS_DELAY_MS;
  try {
    return await fn();
  } finally {
    if (previous === undefined) delete process.env.MIMIMILLI_ATOMIC_WRITE_CAS_DELAY_MS;
    else process.env.MIMIMILLI_ATOMIC_WRITE_CAS_DELAY_MS = previous;
  }
}

test("CASとrenameの間に並行書き込みがあっても後勝ち消失しない", async (t) => {
  const directory = makeTestDirectory("meta-cas-lock");
  t.after(directory.cleanup);
  const workDir = join(directory.path, "work");
  mkdirSync(workDir);
  const metaPath = join(workDir, "mimimilli.json");

  await withCasDelay(30, async () => {
    for (let i = 0; i < 10; i++) {
      const bytes = writeSampleMeta(metaPath);
      const results = await runConcurrentPatches(metaPath, sourceRevision(bytes));
      assertSingleCompleteWrite(metaPath, results);
    }
  });

  await withCasDelay(0, async () => {
    for (let i = 0; i < 20; i++) {
      const bytes = writeSampleMeta(metaPath);
      const results = await runConcurrentPatches(metaPath, sourceRevision(bytes));
      assertSingleCompleteWrite(metaPath, results);
    }
  });
});
