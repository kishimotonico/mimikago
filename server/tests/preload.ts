// bunfig.toml [test].preload から読み込まれ、直接の `bun test` 呼び出しにも適用される。
// タイムアウトはハング検出器であり、正常系の所要時間検証ではない。値の根拠はTASK-393の負荷実測を参照。
import { setDefaultTimeout } from "bun:test";
import { TEST_RUNNER_TIMEOUT_MS } from "./helpers/poll.ts";

setDefaultTimeout(TEST_RUNNER_TIMEOUT_MS);
