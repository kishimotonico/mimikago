import { writeFileSync } from "node:fs";
import { openDb } from "../../../src/adapters/real/db.ts";

const [catalogPath, userPath, backupDir, startedMarker] = process.argv.slice(2);
if (!catalogPath || !userPath || !backupDir) {
  throw new Error("usage: openDbHarness.ts <catalogPath> <userPath> <backupDir> [startedMarker]");
}

const hold = new Int32Array(new SharedArrayBuffer(4));
openDb(
  { kind: "files", catalogPath, userPath },
  {
    backupDir,
    onPendingMigration: startedMarker
      ? (kind) => {
          if (kind !== "user") return;
          writeFileSync(startedMarker, "");
          while (true) Atomics.wait(hold, 0, 0);
        }
      : undefined,
  },
).close();
