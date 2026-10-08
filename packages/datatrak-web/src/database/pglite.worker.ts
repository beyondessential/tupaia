/// <reference lib="webworker" />
import { PGlite, types } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';
// PGlite locates these two files itself with `new URL('pglite.wasm', import.meta.url)`, but that
// happens at runtime where Vite can't rewrite it, so after bundling it would request an asset
// that doesn't exist. Import them explicitly instead ('pglite-dist' is an alias in vite.config.js)
// so they get hashed, cache-safe URLs, and hand them to PGlite below.
import fsBundleUrl from 'pglite-dist/pglite.data?url';
import wasmUrl from 'pglite-dist/pglite.wasm?url';

/**
 * PGlite must run in a dedicated worker, not on the main thread. Loading an extension module —
 * which happens whenever a plpgsql function is defined or `CREATE EXTENSION plpgsql` actually
 * executes — makes Emscripten compile the module's WebAssembly synchronously, and Chromium forbids
 * synchronous compilation of buffers over 4KB on the main thread ("RangeError: WebAssembly.Compile
 * is disallowed on the main thread"). Workers have no such restriction. It also keeps Postgres
 * work off the UI thread.
 */

declare const self: DedicatedWorkerGlobalScope & typeof globalThis;

const LEVELS = ['log', 'info', 'warn', 'error', 'debug'] as const;

const formatArg = (arg: unknown) => {
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return arg.stack ?? arg.message;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
};

/*
 * PGlite reports what it is doing (whether it ran initdb or resumed an existing database, and
 * anything initdb itself printed) through `console`, which now fires in this worker where the
 * startup log capture (see startupLog.ts) can't see it. Forward it to the main thread, which
 * re-emits it through its own `console`. Formatted to strings here so every payload is cloneable.
 *
 * Forwarded over a dedicated BroadcastChannel, NOT `self.postMessage`: PGliteWorker's handshake
 * requires the first message it receives from this worker to be its own `type: "here"` — a log
 * message arriving first is consumed instead and the handshake never completes, so the database
 * never becomes ready.
 */
const logChannel = new BroadcastChannel('datatrak-pglite-log');
for (const level of LEVELS) {
  const original = console[level];
  console[level] = (...args: unknown[]) => {
    original.apply(console, args);
    logChannel.postMessage({ level, args: args.map(formatArg) });
  };
}

/**
 * Where the Postgres data directory actually lives.
 *
 * `idb://` is Emscripten's IDBFS, which is MEMFS with IndexedDB bolted on for durability: every
 * file is held as a JS `Uint8Array` for the life of the session, so the *whole database* is
 * resident in this renderer's memory — hundreds of megabytes for a large project, invisible to
 * both `performance.memory` (which ignores ArrayBuffers) and the WASM heap size.
 *
 * `opfs-ahp://` keeps the files in the Origin Private File System instead, so Postgres reads and
 * writes pages on demand the way it would on a real disk, and only the working set is in memory.
 *
 * TEMPORARY (TUP-3193): forced to OPFS with no feature detection and no fallback, so that the
 * indicator on the sync page cannot be a false positive — there is only one branch, so if the app
 * starts at all it started on OPFS.
 *
 * The cost is that any browser PGlite can't run OPFS on now fails outright instead of degrading:
 * Chrome below 102, and Safari, where the access-handle pool aborts even though every capability
 * test passes. Restore the detection before this goes anywhere near production:
 *
 *   const canUseOpfs =
 *     typeof FileSystemFileHandle !== 'undefined' &&
 *     'createSyncAccessHandle' in FileSystemFileHandle.prototype &&
 *     typeof navigator !== 'undefined' &&
 *     typeof navigator.storage?.getDirectory === 'function';
 *
 * Note the two are separate stores. A device that switches starts from an empty database and
 * re-syncs from scratch.
 */
const resolveDataDir = (dataDir: string | undefined) => {
  if (!dataDir?.startsWith('idb://')) return dataDir;

  return dataDir.replace(/^idb:\/\//, 'opfs-ahp://');
};

worker({
  init: async options => {
    /*
     * Note on `relaxedDurability`: it makes every write to IndexedDB fire-and-forget, which is a
     * large speed-up, but it is unsafe during first-run setup. PGlite creates the database cluster,
     * then persists the whole data directory with `await syncToFs()` — and under relaxed durability
     * that await returns before the write lands. Setup reports success, the app carries on, and if
     * anything closes or reloads the page before the background write finishes, IndexedDB is left
     * holding a partial data directory. PGlite then finds it on the next launch, takes its "found
     * DB, resuming" path instead of running initdb again, and the database comes up missing pieces
     * (which surfaces as errors like `language "plpgsql" does not exist`). That state is permanent
     * until storage is cleared.
     *
     * Note also that with the flag on there is no way to force a durable flush: `syncToFs()` never
     * awaits the real write, so an explicit call at a safe point doesn’t help.
     *
     * If reinstating it, gate it so it is only enabled once a first startup has completed.
     */
    // WebAssembly.compile rather than compileStreaming, so a misconfigured `Content-Type` on the
    // .wasm file can't break startup
    const [wasmModule, fsBundle] = await Promise.all([
      fetch(wasmUrl)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.compile(bytes)),
      fetch(fsBundleUrl).then(response => response.blob()),
    ]);

    const dataDir = resolveDataDir(options.dataDir);

    const db = new PGlite({
      dataDir,
      debug: options.debug,
      wasmModule,
      fsBundle,
      /*
       * TUP-3193: turned off to test the renderer's memory. `dumpsys meminfo` showed ~1 GB in the
       * renderer of which 981 MB is anonymous ("Unknown"), while the V8 heap is 78 MB and PGlite's
       * WASM heap 174 MB — so ~730 MB is ArrayBuffers. IDBFS persists by copying whole file
       * contents out of WASM memory into JS ArrayBuffers, and with relaxed durability those writes
       * are fire-and-forget, so several copies of the Postgres data files can be in flight at once
       * with nothing throttling them. Awaiting each flush serialises them.
       *
       * Expect sync to be slower. If the memory spikes flatten, this is the mechanism.
       */
      relaxedDurability: false,
    });
    await db.waitReady;

    /*
     * Reported only once the database is actually up, so the log line and the indicator on the
     * sync page describe what started rather than what we asked for. Logged before `waitReady`
     * it would claim OPFS even on a browser where PGlite then fails to initialise on it.
     *
     * Rides the console forwarding above, so it reaches the app's log too.
     */
    console.log(
      `PGlite filesystem: ${dataDir?.split('://')[0] ?? 'memory'} (requested ${options.dataDir})`,
    );

    /*
     * TEMPORARY DIAGNOSTIC (TUP-3193) — remove with crashLog.ts
     *
     * PGlite holds the whole Postgres data directory in this worker's WASM linear memory
     * (`idb://` mounts Emscripten's IDBFS, which is MEMFS plus IndexedDB writeback), and that
     * memory only ever grows — `memory.grow` cannot shrink. It is charged to the same renderer
     * process as the page but is invisible to `performance.memory`, which reports the V8 heap
     * only, so it has to be sampled here. Rides the console forwarding set up above.
     */
    setInterval(() => {
      const bytes = (db as unknown as { Module?: { HEAP8?: Uint8Array } }).Module?.HEAP8
        ?.byteLength;
      if (bytes) console.debug(`wasmHeapMb ${Math.round(bytes / 1024 / 1024)}`);
    }, 2_000);

    // Default parser for TIMESTAMP (without time zone) is the `Date` constructor, but that
    // interprets the input string in UTC. We want to treat these as floating times. Must be set
    // here rather than on the main thread: rows are parsed in this worker before being cloned
    // across, so parsers set on the PGliteWorker side would never run.
    db.parsers[types.TIMESTAMP] = (value: string) => value;

    return db;
  },
});
