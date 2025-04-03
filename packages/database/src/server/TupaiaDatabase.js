import { types as pgTypes } from 'pg';

import { BaseDatabase } from '../core';
import { getConnectionConfig } from './getConnectionConfig';
import { DatabaseChangeChannel } from './DatabaseChangeChannel';

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
    return super.getChangeHandlersForCollection();
  }

  addSchemaChangeHandler(handler) {
    const changeChannel = this.getOrCreateChangeChannel();
    return changeChannel.addSchemaChangeHandler(handler);
  }

  wrapInTransaction(wrappedFunction) {
    return this.connection.transaction(transaction =>
      wrappedFunction(new TupaiaDatabase(transaction, this.changeChannel)),
    );
  }

  async markRecordsAsChanged(recordType, records) {
    await this.getOrCreateChangeChannel().publishRecordUpdates(recordType, records);
  }
}
