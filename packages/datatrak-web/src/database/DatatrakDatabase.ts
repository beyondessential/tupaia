import ClientPgLite from 'knex-pglite';
import type { Knex } from 'knex';

import { BaseDatabase, DatabaseChangeChannel } from '@tupaia/database';

import { getConnectionConfig } from './getConnectionConfig';
import { BrowserChangeChannel } from './BrowserChangeChannel';

/**
 * Ideally this should stay in the database package, but it has to stay here to avoid build problems
 */
export class DatatrakDatabase extends BaseDatabase {
  constructor(
    transactingConnection?: Knex.Transaction,
    transactingChangeChannel?: DatabaseChangeChannel,
  ) {
    super(transactingConnection, transactingChangeChannel, ClientPgLite, getConnectionConfig);
  }

  wrapInTransaction(wrappedFunction: (db: DatatrakDatabase) => Promise<void | unknown>) {
    return this.connection.transaction(transaction =>
      wrappedFunction(new DatatrakDatabase(transaction, this.changeChannel)),
    );
  }

  createChangeChannel() {
    return new DatabaseChangeChannel(new BrowserChangeChannel());
  }
}
