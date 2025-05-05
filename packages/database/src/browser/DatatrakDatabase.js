import ClientPgLite from 'knex-pglite';

import { getConnectionConfig } from './getConnectionConfig';
import { BaseDatabase } from '../core';

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
