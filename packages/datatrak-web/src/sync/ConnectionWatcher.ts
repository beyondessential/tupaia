import { sleep } from '@tupaia/utils';

import type { DatatrakDatabase } from '../database/DatatrakDatabase';

/**
 * Watches the queries asking for PGlite’s only connection. PGlite is a single Postgres session, so
 * knex-pglite fixes knex’s connection pool at one connection (`pool: { min: 1, max: 1 }`, and it
 * throws if you try to configure it). Every query outside a transaction borrows that connection
 * from the pool, and a transaction keeps it until it ends. While sync saves inside a transaction,
 * the transaction already holds the connection, so any query asking for it comes from the app.
 * (Queries inside a transaction use the transaction’s connection, so they don’t ask.)
 */
export class ConnectionWatcher {
  /** Queries waiting for the connection */
  waitingCount = 0;

  private lastActivityTime = 0;

  constructor(database: DatatrakDatabase) {
    const { client } = database.connection;
    const acquireConnection = client.acquireConnection.bind(client);
    client.acquireConnection = async () => {
      this.waitingCount++;
      this.lastActivityTime = Date.now();
      try {
        return await acquireConnection();
      } finally {
        this.waitingCount--;
      }
    };
    client.pool.on('release', () => {
      this.lastActivityTime = Date.now();
    });
  }

  /**
   * Waits until nothing has used the connection for `idleMs`. Returns false once `deadline` (a
   * timestamp) has passed, even if it is idle by then.
   */
  async waitUntilIdle(idleMs: number, deadline = Infinity): Promise<boolean> {
    for (;;) {
      if (Date.now() >= deadline) return false;
      const idleFor = Date.now() - this.lastActivityTime;
      if (this.waitingCount === 0 && idleFor >= idleMs) return true;
      await sleep(Math.max(idleMs - idleFor, 100));
    }
  }
}
