import { PGliteWorker } from '@electric-sql/pglite/worker';

import { getEnvVarOrDefault } from '@tupaia/utils';

// TEMPORARY DIAGNOSTIC (TUP-3193) — imported directly rather than through the utils barrel,
// which pulls in React hooks this module has no business loading
import { crashLog, setStorageBackend } from '../utils/crashLog';

let sharedPGliteInstance: PGliteWorker | null = null;

const LEVELS = ['log', 'info', 'warn', 'error', 'debug'] as const;

type Level = (typeof LEVELS)[number];

const isLevel = (level: unknown): level is Level => LEVELS.includes(level as Level);

/**
 * Re-emit log lines forwarded from the PGlite worker (see pglite.worker.ts) through this thread's
 * `console`, so the startup log capture (startupLog.ts) sees them. A dedicated BroadcastChannel,
 * separate from the worker's own message channel, which PGliteWorker's handshake protocol owns.
 */
const forwardWorkerLogs = () => {
  const logChannel = new BroadcastChannel('datatrak-pglite-log');
  logChannel.addEventListener('message', event => {
    const { data } = event;
    const level: Level = isLevel(data?.level) ? data.level : 'log';
    console[level]('[pglite worker]', ...(Array.isArray(data?.args) ? data.args : []));

    const [firstArg] = Array.isArray(data?.args) ? data.args : [];
    if (typeof firstArg === 'string' && firstArg.startsWith('PGlite filesystem:')) {
      const [, backend] = firstArg.match(/PGlite filesystem: (\S+)/) ?? [];
      if (backend) setStorageBackend(backend);
    }

    /*
     * TEMPORARY DIAGNOSTIC (TUP-3193): mirror the worker's WASM heap figure into the crash log
     * so it lands in localStorage alongside the sync timeline. It is the one number that shows
     * PGlite's real memory use, and `performance.memory` cannot see it.
     */
    const [first] = Array.isArray(data?.args) ? data.args : [];
    if (typeof first === 'string' && first.startsWith('wasmHeapMb')) {
      crashLog('pglite', { heap: first });
    }
  });
};

export const getConnectionConfig = () => {
  const connectionString = getEnvVarOrDefault('PG_LITE_CONNECTION_STRING', 'idb://datatrak-db');

  // IMPORTANT: Reuse the same PGlite instance to avoid data isolation issues
  if (!sharedPGliteInstance) {
    // PGlite must run in a worker, not on this thread — see pglite.worker.ts for why
    const workerInstance = new Worker(new URL('./pglite.worker.ts', import.meta.url), {
      type: 'module',
      name: 'pglite',
    });
    forwardWorkerLogs();

    sharedPGliteInstance = new PGliteWorker(workerInstance, {
      dataDir: connectionString,
      relaxedDurability: false, // TUP-3193: temporary false, see the note in pglite.worker.ts
    });
  }

  return {
    pglite: sharedPGliteInstance,
  };
};
