import { defineConfig, devices } from "@playwright/test";

// fixture アダプタの可変状態はworkerごとに起動するBun+Viteサーバーペア（tests/smoke/fixtures.ts）
// に分離され、各テスト開始前にリセットされる。ポート導出もfixtures.ts側でworkerIndexを含めて行う。
// 並列度は12スレッド機材での実測に基づく（TASK-383）。
const SMOKE_WORKERS = 4;

export default defineConfig({
  testDir: "./tests/smoke",
  outputDir: "./test-results/smoke",
  fullyParallel: true,
  workers: SMOKE_WORKERS,
  // smokeは見た目のズレでは落ちず赤=実際の不具合なので、リトライで隠さず即座に検知する。
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 960 },
      },
    },
  ],
});
