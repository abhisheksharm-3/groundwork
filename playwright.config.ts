/**
 * End-to-end tests against a production build, because Next does not prefetch in
 * dev and the instant-navigation guard is only meaningful where prefetching runs.
 * The build sets NEXT_E2E so it exposes the testing API `instant()` drives.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 3456;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `next build && next start -p ${PORT}`,
    env: { NEXT_E2E: "1" },
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: false,
  },
});
