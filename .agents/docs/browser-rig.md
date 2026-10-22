---
workhorse-version: 0.7.2
---

# Driving the app in a real browser

How an agent gets a browser, runs the workspace's app and drives it, in a workspace it has never seen. `qa-loop` and `hands-free-feature` depend on it. Nothing here is guaranteed by the platform: a browser, the app's dependencies, a database and network access are all things to check, and a check that fails is reported, never assumed away.

## Where a browser can run

- **On the user's device**, in a local conversation: Bash is unrestricted, so everything below applies.
- **On the cloud**: Bash is restricted and there is no browser. Say so at the start of the run, do every check that needs no browser, and list each browser check as not verified. Do not substitute reading the code for running it.

## 1. Preflight: prove you have a browser

Work down the list and stop at the first that passes the smoke test.

1. **The repo's own Playwright** (`@playwright/test` or `playwright` in its `package.json`): use its version and config, with `npx playwright install chromium` if its browser is missing.
2. **System Chrome or Chromium**, driven by `playwright-core` with `channel: 'chrome'` (or `executablePath`). Check the usual places: `/Applications/Google Chrome.app` on macOS, `google-chrome`, `chromium` or `chromium-browser` on the path on Linux, `Program Files\Google\Chrome` on Windows.
3. **Playwright's own Chromium**, installed into its cache by `npx playwright-core install chromium` (about 100 MB, needs the network, and is the same cache every Playwright project on the machine uses). A cache that already holds some Chromium is not enough: `playwright-core` wants the build matching its own version, and a mismatch fails with "Executable doesn't exist". Install, rather than reusing what is there.

Install `playwright-core` in the rig directory (below), not in the repo, so no dependency lands in the user's `package.json`.

**The smoke test is the only judge.** Launch headless, open a `data:` URL, set CPU throttling over CDP, take a screenshot and close, within about 30 seconds:

```js
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ headless: true, channel: process.env.CHANNEL })
const page = await browser.newPage()
await page.goto('data:text/html,<h1>ok</h1>')
const cdp = await page.context().newCDPSession(page)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
await page.screenshot({ path: 'smoke.png' })
await browser.close()
```

Leave `CHANNEL` unset for Playwright's Chromium and set it to `chrome` for system Chrome. If nothing passes, write "no browser" and the reason in the loop log, mark every browser check not verified, and say in the final report what the user would need to install. Do not stop to ask mid-run.

## 2. The rig directory

One durable directory holds everything the run needs, outside the repo and outside `/tmp`, which the operating system cleans mid-run:

- macOS: `~/Library/Caches/workhorse-rig/{repo}/{card-id}`
- Linux: `${XDG_CACHE_HOME:-~/.cache}/workhorse-rig/{repo}/{card-id}`
- Windows: `%LOCALAPPDATA%\workhorse-rig\{repo}\{card-id}`

It holds `playwright-core`, the scripts, screenshots and filmstrips, the seed and its dump, the reports, and a short `README.md` naming the ports, process ids and how to restart it. Record its path in the loop log, and have every agent reuse it rather than building its own. Agents that start their own databases and servers collide on ports and test the wrong thing.

## 3. Running the app

Do not assume how. Find out, in this order:

1. The repo's own instructions: `CLAUDE.md`, `AGENTS.md`, `README`, `package.json` scripts, `Makefile`, `docker-compose`, a project skill for running the app, and the `run` skill where it exists.
2. A production build served detached from a copy of the worktree (excluding build output, with its own installed dependencies) when the app has one, because the development server's behaviour differs on exactly the things feel depends on. Otherwise the development server.

Rules for every run:

- **Bind to `127.0.0.1`** on a free port of your own choosing, and record it. Never use a port another process holds.
- **A throwaway database** with a seed, restored from a dump before each run, so a run starts from known data. Never point the app at real data or real credentials. Use the repo's own test-database conventions where it has them.
- **Fake external services** (mail, payments, third-party APIs) rather than the real ones.
- **Sign-in** through whatever the repo offers for tests: a seeded session, a test login or a dev bypass. Seed two users with different permissions where the surface is multi-user.
- **Kill only what you started.** Record the process ids and stop those. Never `pkill -f` on a pattern: the shell running the command matches too.

If the app cannot be started after a fair attempt (missing services, secrets only the user has), say what blocked it, and test the layers that do run: unit, integration, API through the test harness.

## 4. Driving it

Script every flow with Playwright, kept in the rig's `scripts/` folder.

- **Time input to result:** from the input event to the first animation frame in which the visible result is true (`requestAnimationFrame` after the change, or `performance.now()` across a mutation observer).
- **Throttle twice.** Run each flow locally and again on Fast 3G with 4x CPU: `Emulation.setCPUThrottlingRate` with `rate: 4`, and `Network.emulateNetworkConditions` with `latency: 150`, `downloadThroughput: 204800`, `uploadThroughput: 96000` (bytes per second, so about 1.6 and 0.75 Mbit/s).
- **Record on every step:** console errors and warnings, `pageerror`, failed and 4xx or 5xx requests, layout shift (a `PerformanceObserver` on `layout-shift`), and the focused element (`document.activeElement`).
- **Filmstrip an interaction:** a screenshot per frame, or a trace, for anything that animates, drags or reflows. Look at each frame for a flicker, a double paint, a jump, or a frame holding both the old and the new state.
- **Viewports:** 1440, 1024 and 390 wide, at a device scale factor of 2 when measuring.
- **Two people:** two browser contexts, signed in as different users, for anything shared or live.
- **Break the connection and the session:** `context.setOffline(true)`, reload mid-action, Back and forward, an expired session, a server restart.
- **Keyboard only:** drive a flow with no pointer, and note where focus goes after each action.
- **Accessibility:** inject `axe-core` from the rig where it installs, and read the accessibility tree with `page.locator('body').ariaSnapshot()` for names, roles and state.

Keep every script. A finding is only as good as the script that reproduces it.

## 5. Evidence and tests

- Each browser finding names the script, the viewport and throttling it ran under, and the screenshots, so a fixer and a re-checker can run the same thing.
- Looking at screenshots is the orchestrator's job. Capturing them is an agent's.
- The rig is scaffolding and is not committed. A defect it finds that the repo's own tests did not cover gets a committed test in the repo, written in the repo's style at the lowest level that would have caught it. A defect only a browser shows (layout, focus, timing) gets an end-to-end test in the repo's own browser test framework, if it has one. If it has none, record the case in the test-cases file and as a follow-up, and do not introduce a framework silently.
