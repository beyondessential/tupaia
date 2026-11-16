/// <reference lib="webworker" />
import { PGlite, types } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';
// PGlite locates these two files itself with `new URL('pglite.wasm', import.meta.url)`, but that
// happens at runtime where Vite can't rewrite it, so after bundling it would request an asset
// that doesn't exist. Import them explicitly instead ('pglite-dist' is an alias in vite.config.js)
// so they get hashed, cache-safe URLs, and hand them to PGlite below.
import fsBundleUrl from 'pglite-dist/pglite.data?url';
import wasmUrl from 'pglite-dist/pglite.wasm?url';
import { PGLITE_LOG_CHANNEL, STARTUP_FAILED } from './pgliteWorkerMessages';

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
const logChannel = new BroadcastChannel(PGLITE_LOG_CHANNEL);
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
 * We use it wherever it is available, and fall back to IndexedDB otherwise: when the capability
 * check fails (Chrome below 102), or when PGlite fails to start on OPFS anyway (Safari, where the
 * access-handle pool aborts even though every check passes).
 *
 * Note the two are separate stores. A device that switches starts from an empty database and
 * re-syncs from scratch. So once a device has a database on OPFS, failing to open it must NOT fall
 * back: the empty IndexedDB database it would get instead looks like a logout (who is logged in is
 * kept in the database), hides any responses that haven’t synced yet, and then re-pulls everything
 * into memory, which is enough to get the page killed on a low-memory phone.
 */
const canUseOpfs = () =>
  typeof FileSystemFileHandle !== 'undefined' &&
  'createSyncAccessHandle' in FileSystemFileHandle.prototype &&
  typeof navigator.storage?.getDirectory === 'function';

const toOpfsDataDir = (dataDir: string) => dataDir.replace(/^idb:\/\//, 'opfs-ahp://');

/**
 * Waits before each retry of opening OPFS. An access handle can only be open in one place at a
 * time, and the worker of the page this one replaced (on a reload, say) may still be closing its
 * handles when we start.
 */
const OPFS_RETRY_DELAYS_MS = [500, 1_000, 2_000, 4_000];

/**
 * Written to the OPFS root once a database has opened there, so later failures to open it can be
 * told apart from a browser where OPFS doesn’t work at all.
 *
 * Kept outside PGlite’s directory, which PGlite itself creates before it fails on Safari.
 */
const opfsMarkerName = (opfsDataDir: string) =>
  `${opfsDataDir.replace(/^opfs-ahp:\/\//, '').replace(/\//g, '_')}.opened`;

const hasOpenedOnOpfsBefore = async (opfsDataDir: string) => {
  try {
    const root = await navigator.storage.getDirectory();
    await root.getFileHandle(opfsMarkerName(opfsDataDir));
    return true;
  } catch {
    return false;
  }
};

const markOpenedOnOpfs = async (opfsDataDir: string) => {
  try {
    const root = await navigator.storage.getDirectory();
    await root.getFileHandle(opfsMarkerName(opfsDataDir), { create: true });
  } catch (error) {
    console.warn('Couldn’t record that the database opened on OPFS', error);
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

worker({
  init: async options => {
    /*
     * Note on `relaxedDurability`: it makes every filesystem write fire-and-forget, which is a large
     * speed-up, but it is unsafe during first-run setup. PGlite creates the database cluster, then
     * persists the whole data directory with `await syncToFs()` — and under relaxed durability that
     * await returns before the write lands. If anything closes or reloads the page before the
     * background write finishes, storage is left holding a partial data directory. PGlite then
     * finds it on the next launch, takes its "found DB, resuming" path instead of running initdb
     * again, and the database comes up missing pieces (which surfaces as errors like `language
     * "plpgsql" does not exist`). That state is permanent until storage is cleared.
     *
     * With the flag on there is no way to force a durable flush either — `syncToFs()` never awaits
     * the real write.
     *
     * It also breaks OPFS: the opfs-ahp filesystem refills its pool of spare file handles in that
     * same background sync, which falls behind when statements run back to back. A few large
     * writes in a row (e.g. a survey response with several photos) drain the pool, PGlite throws
     * "No more file handles available in the pool" mid-statement, and the connection is left
     * stuck in an aborted transaction (`cannot drop active portal`) until the page reloads.
     *
     * Off. Don't reinstate it on OPFS without solving the pool refill.
     */
    // WebAssembly.compile rather than compileStreaming, so a misconfigured `Content-Type` on the
    // .wasm file can't break startup
    const [wasmModule, fsBundle] = await Promise.all([
      fetch(wasmUrl)
        .then(response => response.arrayBuffer())
        .then(bytes => WebAssembly.compile(bytes)),
      fetch(fsBundleUrl).then(response => response.blob()),
    ]);

    const openDatabase = async (dataDir: string | undefined) => {
      const db = new PGlite({
        dataDir,
        debug: options.debug,
        wasmModule,
        fsBundle,
        relaxedDurability: false,
      });
      try {
        await db.waitReady;
      } catch (error) {
        // Release whatever file handles it did get, so that a retry isn't blocked by our own
        await db.close().catch(() => {});
        throw error;
      }
      return db;
    };

    const openOnOpfs = async (opfsDataDir: string) => {
      for (let attempt = 0; ; attempt++) {
        try {
          return await openDatabase(opfsDataDir);
        } catch (error) {
          if (attempt >= OPFS_RETRY_DELAYS_MS.length) throw error;
          console.warn(`PGlite could not start on OPFS (attempt ${attempt + 1}), retrying`, error);
          await sleep(OPFS_RETRY_DELAYS_MS[attempt]);
        }
      }
    };

    const openWithOpfsFallback = async (): Promise<{ db: PGlite; dataDir: string | undefined }> => {
      const requested = options.dataDir;
      if (!requested?.startsWith('idb://') || !canUseOpfs()) {
        return { db: await openDatabase(requested), dataDir: requested };
      }

      const opfsDataDir = toOpfsDataDir(requested);
      try {
        const db = await openOnOpfs(opfsDataDir);
        await markOpenedOnOpfs(opfsDataDir);
        return { db, dataDir: opfsDataDir };
      } catch (error) {
        if (await hasOpenedOnOpfsBefore(opfsDataDir)) {
          // This device's data is on OPFS. Fail visibly rather than carry on with an empty database
          console.error('PGlite could not open the existing database on OPFS', error);
          throw new Error(
            'DataTrak couldn’t open its database on this device. Close DataTrak completely, then open it again.',
            { cause: error },
          );
        }
        console.warn('PGlite could not start on OPFS, falling back to IndexedDB', error);
        return { db: await openDatabase(requested), dataDir: requested };
      }
    };

    let opened: Awaited<ReturnType<typeof openWithOpfsFallback>>;
    try {
      opened = await openWithOpfsFallback();
    } catch (error) {
      /*
       * PGliteWorker doesn’t pass a failed `init` back to the page: its `waitReady` just never
       * resolves, and the page would sit on the loading screen forever. Tell it ourselves, over
       * the log channel, so it can show the startup failure screen.
       */
      const { message, stack } = error instanceof Error ? error : new Error(String(error));
      const cause =
        error instanceof Error && error.cause !== undefined ? formatArg(error.cause) : '';
      logChannel.postMessage({
        kind: STARTUP_FAILED,
        message,
        stack: [stack, cause].filter(Boolean).join('\nCaused by: '),
      });
      throw error;
    }
    const { db, dataDir } = opened;

    /*
     * Reported only once the database is actually up, so the log line describes what started
     * rather than what we asked for.
     *
     * Rides the console forwarding above, so it reaches the app's log too.
     */
    console.log(
      `PGlite filesystem: ${dataDir?.split('://')[0] ?? 'memory'} (requested ${options.dataDir})`,
    );

    // Default parser for TIMESTAMP (without time zone) is the `Date` constructor, but that
    // interprets the input string in UTC. We want to treat these as floating times. Must be set
    // here rather than on the main thread: rows are parsed in this worker before being cloned
    // across, so parsers set on the PGliteWorker side would never run.
    db.parsers[types.TIMESTAMP] = (value: string) => value;

    return db;
  },
});
