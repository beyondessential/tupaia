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
   * Custom type parsers are set inside the PGlite worker (see pglite.worker.ts) — rows are parsed
   * there before being cloned to this thread, so parsers set here would never run.
   */
  async setCustomTypeParsers() {}

  async wrapInTransaction<T = unknown>(
    wrappedFunction: (db: DatatrakDatabase) => Promise<T>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T> {
    return await this.connection.transaction<T>(
      transaction => wrappedFunction(new DatatrakDatabase(transaction)),
      transactionConfig,
    );
  }
}
