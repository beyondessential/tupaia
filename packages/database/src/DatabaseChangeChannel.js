/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PGPubSub from 'pg-pubsub';
import { generateId } from './utilities/generateId';

import { getConnectionConfig } from './getConnectionConfig';

export class DatabaseChangeChannel extends PGPubSub {
  constructor() {
    super(getConnectionConfig());
    this.pingListeners = {};
    this.addChannel('ping', this.notifyPingListeners);
  }

  async close() {
    return super.close();
  }

  addDataChangeHandler(handler) {
    this.addChannel('change', handler);
  }

  addSchemaChangeHandler(handler) {
    this.addChannel('schema_change', handler);
  }

  publishRecordUpdates(recordType, records, specificHandlerKey) {
    records.forEach(record =>
      this.publish('change', {
        record_id: record.id,
        type: 'update',
        record_type: recordType,
        handler_key: specificHandlerKey,
        old_record: record,
        new_record: record,
      }),
    );
  }

  /**
   * Sends a ping request out to the database and listens for a response
   * @param {number} timeout - default 250ms
   * @param {number} retries - default 240 (i.e. 1 minute total wait time)
   */
  async ping(timeout = 250, retries = 240) {
    return new Promise((resolve, reject) => {
      let tries = 0;
      let nextRequest;
      const id = generateId();
      this.pingListeners[id] = result => {
        delete this.pingListeners[id];
        clearTimeout(nextRequest);
        resolve(result);
      };

      const pingRequest = () => {
        this.publish('ping', true);
        if (tries < retries) {
          nextRequest = setTimeout(pingRequest, timeout);
        } else {
          delete this.pingListeners[id];
          reject(new Error(`pubsub ping timed out after ${tries} attempts of ${timeout}ms`));
        }
        tries++;
      };

      pingRequest();
    });
  }

  notifyPingListeners(result) {
    Object.values(this.pingListeners).forEach(listener => {
      listener(result);
    });
  }
}
