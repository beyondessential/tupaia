import ClientPgLite from 'knex-pglite';

import { BaseDatabase } from '@tupaia/database';

import { getConnectionConfig } from './getConnectionConfig';

/**
 * Ideally this should stay in the database package, but it has to stay here to avoid build problems
 */
export class DatatrakDatabase extends BaseDatabase {
  constructor(transactingConnection) {
    super(transactingConnection, undefined, ClientPgLite, getConnectionConfig);
  }

  wrapInTransaction(wrappedFunction) {
    return this.connection.transaction(transaction =>
      wrappedFunction(new DatatrakDatabase(transaction)),
    );
  }
}
