import { PGliteWorker } from '@electric-sql/pglite/worker';

import { getEnvVarOrDefault } from '@tupaia/utils';

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
      // TEMPORARY — REMOVE BEFORE MERGING.
      // Maximum PGlite logging, to diagnose startup failures on low-spec devices. Everything it
      // emits goes through `console`, so it is picked up by the startup log shown on the failure
      // screen. Level 5 logs every protocol message, so it is slow enough to distort any timings
      // taken while it is on.
      debug: 5,
    });
  }

  return {
    pglite: sharedPGliteInstance,
  };
};
