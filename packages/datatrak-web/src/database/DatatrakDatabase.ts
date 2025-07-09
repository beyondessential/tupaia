import ClientPgLite from 'knex-pglite';
import type { Knex } from 'knex';

import { BaseDatabase } from '@tupaia/database';

import { getConnectionConfig } from './getConnectionConfig';

/**
 * Ideally this should stay in the database package, but it has to stay here to avoid build problems
 */
export class DatatrakDatabase extends BaseDatabase {
  constructor(transactingConnection?: Knex.Transaction) {
    super(transactingConnection, undefined, ClientPgLite, getConnectionConfig);
  }

  wrapInTransaction(wrappedFunction: (db: DatatrakDatabase) => Promise<void | unknown>) {
    return this.connection.transaction(transaction =>
      wrappedFunction(new DatatrakDatabase(transaction)),
    );
  }
}
