import { PGliteWorker } from '@electric-sql/pglite/worker';

import { getEnvVarOrDefault } from '@tupaia/utils';
import { PGLITE_LOG_CHANNEL, STARTUP_FAILED, StartupFailedMessage } from './pgliteWorkerMessages';

let sharedPGliteInstance: PGliteWorker | null = null;

/**
 * Rejects if the worker reports that it couldn’t open the database. PGliteWorker’s own
 * `waitReady` never settles in that case, so startup has to race it against this.
 */
let startupFailure: Promise<never> | null = null;

const LEVELS = ['log', 'info', 'warn', 'error', 'debug'] as const;

type Level = (typeof LEVELS)[number];

const isLevel = (level: unknown): level is Level => LEVELS.includes(level as Level);

/**
 * Re-emit log lines forwarded from the PGlite worker (see pglite.worker.ts) through this thread's
 * `console`, so the startup log capture (startupLog.ts) sees them. A dedicated BroadcastChannel,
 * separate from the worker's own message channel, which PGliteWorker's handshake protocol owns.
 */
const forwardWorkerLogs = (onStartupFailed: (error: Error) => void) => {
  const logChannel = new BroadcastChannel(PGLITE_LOG_CHANNEL);
  logChannel.addEventListener('message', event => {
    const { data } = event;
    if (data?.kind === STARTUP_FAILED) {
      const { message, stack } = data as StartupFailedMessage;
      const error = new Error(message);
      if (stack) error.stack = stack;
      onStartupFailed(error);
      return;
    }
    const level: Level = isLevel(data?.level) ? data.level : 'log';
    console[level]('[pglite worker]', ...(Array.isArray(data?.args) ? data.args : []));
  });
};

/**
 * Asks the browser not to evict this site’s storage, which holds the database and any responses
 * not yet synced. Storage is “best effort” until then, and the browser may clear it under storage
 * pressure. Chrome grants or refuses it without prompting (more readily for an installed app), so
 * there is nothing to show the user either way.
 */
const requestPersistentStorage = () => {
  navigator.storage
    ?.persist?.()
    .then(isPersisted =>
      console.log(`Persistent storage ${isPersisted ? 'granted' : 'not granted'}`),
    )
    .catch(error => console.warn('Couldn’t request persistent storage', error));
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
    startupFailure = new Promise<never>((_resolve, reject) => forwardWorkerLogs(reject));
    // Nothing may be awaiting it yet (or ever, once started); don’t let that surface as unhandled
    startupFailure.catch(() => {});
    requestPersistentStorage();

    sharedPGliteInstance = new PGliteWorker(workerInstance, {
      dataDir: connectionString,
    });
  }

  return {
    pglite: sharedPGliteInstance,
    startupFailure: startupFailure as Promise<never>,
  };
};
