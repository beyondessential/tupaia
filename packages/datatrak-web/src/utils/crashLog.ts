/*
 * TEMPORARY DIAGNOSTIC — remove once TUP-3193’s renderer crash is understood.
 *
 * Mirrored into `localStorage` as well as `console`, because the crash kills the renderer and the
 * tester can't attach DevTools to the tablet. After a crash they reload and run `dumpCrashLog()`
 * in the address bar or console; the whole timeline is still there.
 *
 * `console.log` rather than `console.debug`: DevTools hides Verbose at its default log level, and
 * that cost us a run.
 */

const KEY = 'tup3193CrashLog';
const MAX_ENTRIES = 2000;

/*
 * Seeded from whatever survived the last session, so a reload appends rather than overwrites.
 * Without this the first entry after the crash would replace the timeline we crashed to collect.
 * Trimming drops the oldest lines, so the tail of the crashed session outlives a fresh start.
 */
const entries: string[] = (() => {
  try {
    const previous = localStorage.getItem(KEY);
    return previous ? [...previous.split('\n'), `--- reload ${new Date().toISOString()} ---`] : [];
  } catch {
    return [];
  }
})();

export const crashLog = (event: string, data?: Record<string, unknown>) => {
  const entry = `${new Date().toISOString()} ${event}${data ? ` ${JSON.stringify(data)}` : ''}`;
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.shift();

  console.log('[tup3193]', entry);

  try {
    // Serialised from the in-memory copy rather than read-modify-write, so the sink itself does as
    // little work as possible on a device that is already short of memory
    localStorage.setItem(KEY, entries.join('\n'));
  } catch {
    // Storage unavailable or full; the console copy still has this session
  }
};

/** Call from the DevTools console after a crash-and-reload to read the timeline back. */
export const dumpCrashLog = () => (localStorage.getItem(KEY) ?? '').split('\n');

export const clearCrashLog = () => {
  entries.length = 0;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // as above
  }
};

/**
 * A snapshot of everything cheap enough to sample on a timer.
 *
 * `performance.memory` reports the V8 heap only — it cannot see PGlite’s WASM memory, which is
 * sampled separately in the worker (see pglite.worker.ts).
 */
export const sampleRuntime = (extra?: Record<string, unknown>) => {
  const memory = (performance as unknown as { memory?: Record<string, number> }).memory;

  crashLog('sample', {
    ...(memory && {
      heapUsedMb: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      heapTotalMb: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      heapLimitMb: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
    }),
    domNodes: document.getElementsByTagName('*').length,
    ...extra,
  });
};

/**
 * One line at startup describing the device, so a log sent in by a tester is self-describing —
 * no adb needed to know what it ran on.
 *
 * `navigator.deviceMemory` is deliberately coarse (rounded to a power of two, capped at 8), so
 * treat it as "about this much". `heapLimitMb` is a useful cross-check because Chrome derives the
 * V8 cap partly from device memory. `ua` carries the Chrome version, which decides whether things
 * like OPFS are even available to us.
 */
export const logEnvironment = () => {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = (performance as unknown as { memory?: Record<string, number> }).memory;

  crashLog('env', {
    deviceMemoryGb: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    ...(memory && { heapLimitMb: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) }),
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio,
    standalone: window.matchMedia('(display-mode: standalone)').matches,
    appVersion: process.env.REACT_APP_VERSION,
    ua: navigator.userAgent,
  });
};

/**
 * Which filesystem PGlite ended up on — `opfs-ahp` (files on disk) or `idb` (the whole database
 * held in this renderer's memory). The worker decides at startup by feature detection and reports
 * it through its log channel; getConnectionConfig records it here.
 *
 * It lives in this module rather than in `database/` so the sync page can read it without
 * importing anything that constructs a Worker — `new URL(..., import.meta.url)` isn't compilable
 * under the module setting the test build uses.
 */
let storageBackend: string | undefined;

export const setStorageBackend = (backend: string) => {
  storageBackend = backend;
};

export const getStorageBackend = () => storageBackend;

/** Total number of handlers registered across every event type on a mitt emitter. */
export const countEmitterHandlers = (emitter: unknown) => {
  const all = (emitter as { all?: Map<unknown, unknown[]> } | undefined)?.all;
  if (!all) return undefined;
  let total = 0;
  all.forEach(handlers => {
    total += handlers.length;
  });
  return total;
};

/*
 * Module exports aren't reachable from the DevTools console once Vite has bundled, so hang the
 * helpers off `window`. Removed along with the rest of this file.
 */
Object.assign(window as unknown as Record<string, unknown>, { dumpCrashLog, clearCrashLog });
