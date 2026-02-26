import { types } from '@electric-sql/pglite';
import type { Knex } from 'knex';
import ClientPgLite from 'knex-pglite';

import { BaseDatabase } from '@tupaia/database';
import { getConnectionConfig } from './getConnectionConfig';

/**
 * Ideally this should stay in the database package, but it has to stay here to avoid build problems
 */
export class DatatrakDatabase extends BaseDatabase {
  constructor(transactingConnection?: Knex.Transaction) {
    super(transactingConnection, undefined, ClientPgLite, getConnectionConfig);
  }

  /**
   * @override
   * @privateRemarks Theoretically, the `ParserOptions` can be baked into the `PGlite` instance at
   * instantiation time (in {@link getConnectionConfig}), but I couldn’t get that to work so here we
   * use the public setters provided by pglite.
   */
  async setCustomTypeParsers() {
    if (!this.connection) await this.waitUntilConnected();

    // pglite is single-user only, supporting only one connection (enforced by knex-pglite). For
    // instances with a `transactingConnection` (instantiated after the singleton instance, see
    // BaseDatabase constructor), this will be undefined.
    if (!this.connection.client.pglite) return;

    // Default parser for TIMESTAMP (without time zone) is the `Date` constructor, but that
    // interprets input string in UTC. We want to treat these as floating times.
    this.connection.client.pglite.parsers[types.TIMESTAMP] = (val: string) => val;
  }

  async wrapInTransaction<T = unknown>(
    wrappedFunction: (db: DatatrakDatabase) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T> {
    return await this.connection.transaction<T>(
      transaction => wrappedFunction(new DatatrakDatabase(transaction)),
      transactionConfig,
    );
  }

  /**
   * @override
   * Browser-safe close: knex’s pool destroy can throw in the browser (e.g. timeout.close is not
   * a function when the pool uses Node-style timers). Swallow errors so reload/unmount doesn’t
   * leave unhandled rejections; the next load will get a fresh connection anyway.
   */
  override async closeConnections(): Promise<void> {
    try {
      await super.closeConnections();
    } catch (err) {
      console.warn('DatatrakDatabase.closeConnections:', err);
    }
  }
}
