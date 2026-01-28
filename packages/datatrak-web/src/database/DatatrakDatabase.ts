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
    console.log('[DatatrakDatabase.wrapInTransaction] Starting transaction', {
      hasConnection: !!this.connection,
      config: transactionConfig,
    });
    
    try {
      const result = await this.connection.transaction<T>(
        async transaction => {
          console.log('[DatatrakDatabase.wrapInTransaction] Transaction started', {
            isTransaction: transaction.isTransaction,
          });
          
          const transactingDb = new DatatrakDatabase(transaction);
          const innerResult = await wrappedFunction(transactingDb);
          
          console.log('[DatatrakDatabase.wrapInTransaction] Inner function complete, transaction should auto-commit');
          return innerResult;
        },
        transactionConfig,
      );
      
      console.log('[DatatrakDatabase.wrapInTransaction] Transaction committed successfully');
      return result;
    } catch (error: any) {
      console.error('[DatatrakDatabase.wrapInTransaction] Transaction failed/rolled back', {
        error: error?.message,
        errorStack: error?.stack,
      });
      throw error;
    }
  }

  /**
   * Health check to verify database connection is alive
   */
  async healthCheck(): Promise<{ healthy: boolean; error?: string }> {
    try {
      console.log('[DatatrakDatabase.healthCheck] Starting');
      const result = await this.connection.raw('SELECT 1 as health');
      console.log('[DatatrakDatabase.healthCheck] Result', {
        result,
        hasRows: !!result?.rows,
        rowCount: result?.rows?.length,
      });
      return { healthy: true };
    } catch (error: any) {
      console.error('[DatatrakDatabase.healthCheck] Failed', {
        error: error?.message,
        errorStack: error?.stack,
      });
      return { healthy: false, error: error?.message };
    }
  }
}
