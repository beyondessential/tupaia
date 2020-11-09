/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Database } from './Database';
import { Synchroniser } from '../sync';
import { snakeToCamelCase } from '../utilities';
import { constructRecord } from './constructRecord';

export class SyncingDatabase extends Database {
  /**
   * Creates a database for Tupaia Meditrak that will keep itself in sync with the server
   */
  constructor(api) {
    super();
    this.synchroniser = new Synchroniser(this, api);
    this.enableSync = this.enableSync.bind(this);
    this.disableSync = this.disableSync.bind(this);
    this.synchronise = this.synchronise.bind(this);
    this.saveSurveyResponse = this.saveSurveyResponse.bind(this);
  }

  /**
   * Begins regular syncing of data with the server
   */
  enableSync(dispatch) {
    this.synchroniser.enable(dispatch);
  }

  /**
   * Should be called for safety before Database goes out of scope, otherwise sync might try to
   * act without the database being instantiated.
   */
  disableSync() {
    this.synchroniser.disable();
  }

  synchronise(dispatch) {
    return this.synchroniser.synchronise(dispatch);
  }

  /**
   * Parse the batch of incoming changes, and integrate them into the local database
   * @param  {object} changes  The json object the server sent to represent changes
   * @return {none}
   */
  integrateChanges(changes) {
    this.write(() => {
      changes.forEach(change => {
        this.integrateChange(change);
      });
    });
  }

  integrateChange(change) {
    const { action, recordType: syncRecordType, record: syncRecord } = change;
    const recordType = snakeToCamelCase(syncRecordType, true);
    switch (action) {
      case 'update':
      case 'create':
        return this.integrateUpdate(recordType, syncRecord);
      case 'delete':
        return this.integrateDelete(recordType, syncRecord);
      default:
        return false; // Failed to integrate a change with unknown action
    }
  }

  integrateDelete(recordType, syncRecord) {
    if (!syncRecord.id) return false; // If missing record id, fail to integrate delete
    this.deleteByPrimaryKey(recordType, syncRecord.id);
    return true;
  }

  integrateUpdate(recordType, syncRecord) {
    // Convert data from snake case to camel case
    if (!syncRecord) throw new Error(`No sync record for ${recordType}`);
    return constructRecord(this, recordType, syncRecord);
  }

  addChangeToSync(action, recordId) {
    this.synchroniser.addChange(action, recordId);
  }
}
