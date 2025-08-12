import { types as pgTypes } from 'pg';

import { BaseDatabase } from '../core';
import { getConnectionConfig } from './getConnectionConfig';
import { DatabaseChangeChannel } from '../core/DatabaseChangeChannel';
import { TupaiaChangeChannel } from './TupaiaChangeChannel';

export class TupaiaDatabase extends BaseDatabase {
  static IS_CHANGE_HANDLER_SUPPORTED = true;

  /**
   * @param {TupaiaDatabase} [transactingConnection]
   * @param {DatabaseChangeChannel} [transactingChangeChannel]
   */
  constructor(transactingConnection, transactingChangeChannel, useNumericStuff = false) {
    super(transactingConnection, transactingChangeChannel, 'pg', getConnectionConfig);

    this.changeChannel = null; // changeChannel is lazily instantiated - not every database needs it

    this.configurePgGlobals(useNumericStuff);
  }

  configurePgGlobals(useNumericStuff = false) {
    // turn off parsing of timestamp (not timestamptz), so that it stays as a sort of "universal time"
    // string, independent of timezones, rather than being converted to local time
    pgTypes.setTypeParser(pgTypes.builtins.TIMESTAMP, val => val);

    if (useNumericStuff) {
      pgTypes.setTypeParser(pgTypes.builtins.NUMERIC, Number.parseFloat);
      pgTypes.setTypeParser(20, Number.parseInt); // bigInt type to Integer
    }
  }

  /**
   * @param {(models: TupaiaDatabase) => Promise<void>} wrappedFunction
   * @param {Knex.TransactionConfig} [transactionConfig]
   * @returns {Promise} A promise (return value of `knex.transaction()`).
   */
  wrapInTransaction(wrappedFunction, transactionConfig = {}) {
    return this.connection.transaction(
      transaction => wrappedFunction(new TupaiaDatabase(transaction, this.changeChannel)),
      transactionConfig,
    );
  }

  /**
   * @param {(models: TupaiaDatabase) => Promise<void>} wrappedFunction
   * @param {Knex.TransactionConfig} [transactionConfig]
   * @returns {Promise} A promise (return value of `knex.transaction()`).
   */
  wrapInReadOnlyTransaction(wrappedFunction, transactionConfig = {}) {
    return this.wrapInTransaction(wrappedFunction, { ...transactionConfig, readOnly: true });
  }

  /**
   * @param {(models: TupaiaDatabase) => Promise<void>} wrappedFunction
   * @param {Knex.TransactionConfig} [transactionConfig]
   * @returns {Promise<TupaiaDatabase>} TupaiaDatabase instance
   */
  async createTransaction(transactionConfig = {}) {
    const transaction = await this.connection.transaction(transactionConfig);
    return new TupaiaDatabase(transaction, this.changeChannel);
  }

  createChangeChannel() {
    return new DatabaseChangeChannel(new TupaiaChangeChannel());
  }
}
