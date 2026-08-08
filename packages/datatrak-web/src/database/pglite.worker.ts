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

    const db = new PGlite({
      dataDir: options.dataDir,
      debug: options.debug,
      wasmModule,
      fsBundle,
    });
    await db.waitReady;

    // Default parser for TIMESTAMP (without time zone) is the `Date` constructor, but that
    // interprets the input string in UTC. We want to treat these as floating times. Must be set
    // here rather than on the main thread: rows are parsed in this worker before being cloned
    // across, so parsers set on the PGliteWorker side would never run.
    db.parsers[types.TIMESTAMP] = (value: string) => value;

    return db;
  },
});
