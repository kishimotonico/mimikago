/** Bun test runner default timeout (ms). Hang detector, not a latency SLO. Applied via tests/preload.ts. */
export const TEST_RUNNER_TIMEOUT_MS = 30_000;

/** Poll until `predicate` returns true. Hang detection is delegated to the test runner timeout. */
export async function pollUntil(
  predicate: () => boolean | Promise<boolean>,
  intervalMs = 10,
): Promise<void> {
  for (;;) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
