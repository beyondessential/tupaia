import winston from 'winston';
import { types as pgTypes } from 'pg';

import { BaseDatabase } from '../core';
import { getConnectionConfig } from './getConnectionConfig';
import { DatabaseChangeChannel } from './DatabaseChangeChannel';

// no math here, just hand-tuned to be as low as possible while
// keeping all the tests passing
const HANDLER_DEBOUNCE_DURATION = 250;

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

  getHandlersForChange(change) {
    const { handler_key: specificHandlerKey, record_type: recordType } = change;
    const handlersForCollection = this.getChangeHandlersForCollection(recordType);
    if (specificHandlerKey) {
      return handlersForCollection[specificHandlerKey]
        ? [handlersForCollection[specificHandlerKey]]
        : [];
    }
    return Object.values(handlersForCollection);
  }

  async notifyChangeHandlers(change) {
    if (change.record_id === 'entity_aaa_test') {
      console.log('createLock', change);
    }
    const unlock = this.handlerLock.createLock(change.record_id);
    const handlers = this.getHandlersForChange(change);
    try {
      for (let i = 0; i < handlers.length; i++) {
        try {
          if (change.record_id === 'entity_aaa_test') {
            console.log('calling handler', handlers[i].name);
          }
          await handlers[i](change);
        } catch (e) {
          winston.error(e);
        }
      }
    } finally {
      if (change.record_id === 'entity_aaa_test') {
        console.log('unlocking');
      }
      unlock();
    }
  }

  async waitForAllChangeHandlers() {
    return this.handlerLock.waitWithDebounce(HANDLER_DEBOUNCE_DURATION);
  }

  getChangeHandlersForCollection(collectionName) {
    // Instantiate the array if no change handlers currently exist for the collection
    if (!this.changeHandlers[collectionName]) {
      this.changeHandlers[collectionName] = {};
    }
    return this.changeHandlers[collectionName];
  }

  getOrCreateChangeChannel() {
    if (!this.changeChannel) {
      this.changeChannel = this.transactingChangeChannel || new DatabaseChangeChannel();
      this.changeChannel.addDataChangeHandler(this.notifyChangeHandlers);
      this.changeChannelPromise = this.changeChannel.ping(undefined, 0);
    }
    return this.changeChannel;
  }

  async waitUntilConnected() {
    await super.waitUntilConnected();
    if (this.changeChannel) {
      await this.waitForChangeChannel();
    }
  }

  async waitForChangeChannel() {
    this.getOrCreateChangeChannel();
    return this.changeChannelPromise;
  }

  addChangeHandlerForCollection(collectionName, changeHandler, key = this.generateId()) {
    // if a change handler is being added, this db needs a change channel - make sure it's instantiated
    this.getOrCreateChangeChannel();
    this.getChangeHandlersForCollection(collectionName)[key] = changeHandler;
    return () => {
      delete this.getChangeHandlersForCollection(collectionName)[key];
    };
  }

  async closeConnections() {
    if (this.changeChannel) {
      await this.changeChannel.close();
    }
    return super.closeConnections();
  }

  addSchemaChangeHandler(handler) {
    const changeChannel = this.getOrCreateChangeChannel();
    return changeChannel.addSchemaChangeHandler(handler);
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

  async markRecordsAsChanged(recordType, records) {
    await this.getOrCreateChangeChannel().publishRecordUpdates(recordType, records);
  }
}
