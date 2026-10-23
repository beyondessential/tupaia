import { sleep } from '@tupaia/utils';

import type { DatatrakDatabase } from '../database/DatatrakDatabase';

/**
 * Watches the queries asking for PGlite’s only connection. While sync saves inside a transaction,
 * the transaction already holds the connection, so any query asking for it comes from the app.
 * (Queries inside a transaction use the transaction’s connection, so they don’t ask.)
 */
export class ConnectionWatcher {
  /** Queries waiting for the connection */
  waitingCount = 0;

  private lastActivityTime = 0;

  /** While set, queries wait for it before asking knex for the connection */
  private hold: Promise<void> | null = null;

  constructor(database: DatatrakDatabase) {
    const { client } = database.connection;
    const acquireConnection = client.acquireConnection.bind(client);
    client.acquireConnection = async () => {
      this.waitingCount++;
      this.lastActivityTime = Date.now();
      try {
        while (this.hold) await this.hold;
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
   * Makes queries wait until the returned function is called. knex fails a query that waits more
   * than 60 seconds for the connection, but its timer only starts once the query asks for it, so
   * held queries can wait as long as a save takes.
   */
  holdQueries(): () => void {
    let release = () => {};
    const hold = new Promise<void>(resolve => {
      release = resolve;
    });
    this.hold = hold;
    return () => {
      if (this.hold === hold) this.hold = null;
      release();
    };
  }

  /** Resolves once nothing has used the connection for `idleMs` */
  async waitUntilIdle(idleMs: number): Promise<void> {
    for (;;) {
      const idleFor = Date.now() - this.lastActivityTime;
      if (this.waitingCount === 0 && idleFor >= idleMs) return;
      await sleep(Math.max(idleMs - idleFor, 100));
    }
  }
}
