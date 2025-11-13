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
  setCustomTypeParsers() {
    if (!this.connection.client.pglite) return; // Sometimes undefined, not sure why
    // Default parser for TIMESTAMP (without time zone) is the `Date` constructor, but that
    // interprets input string in UTC. We want to treat these as floating times.
    this.connection.client.pglite.parsers[types.TIMESTAMP] = (val: string) => val;
  }

  async wrapInTransaction<T = unknown>(
    wrappedFunction: <T = unknown>(db: DatatrakDatabase) => Promise<T>,
  ): Promise<T> {
    return await this.connection.transaction(transaction =>
      wrappedFunction(new DatatrakDatabase(transaction)),
    );
  }
}
