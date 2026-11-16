/**
 * Shared by the PGlite worker and the page. Kept in its own module so the page can import these
 * without pulling in the worker itself.
 */

/** The BroadcastChannel the worker uses to talk to the page outside PGliteWorker’s own protocol */
export const PGLITE_LOG_CHANNEL = 'datatrak-pglite-log';

/** `kind` of the message the worker sends when the database can’t be opened */
export const STARTUP_FAILED = 'startup-failed';

export interface StartupFailedMessage {
  kind: typeof STARTUP_FAILED;
  message: string;
  stack?: string;
}
