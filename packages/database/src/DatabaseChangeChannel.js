/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import PGPubSub from 'pg-pubsub';
import winston from 'winston';
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

  addChangeHandler(handler) {
    this.addChannel('change', handler);
  }

  publishRecordUpdates(recordType, records, specificHandlerKey) {
    records.forEach(record =>
      this.publish('change', {
        record_id: record.id,
        type: 'update',
        record_type: recordType,
        handler_key: specificHandlerKey,
        record,
      }),
    );
  }

  /**
   * Sends a ping request out to the database and listens for a response
   * @param {number} timeout - default 250ms
   * @param {number} retries - default 4
   */
  async ping(timeout = 250, retries = 4) {
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

      try {
        pingRequest();
      } catch (e) {
        winston.error(e);
      }
    });
  }

  notifyPingListeners(result) {
    Object.values(this.pingListeners).forEach(listener => {
      listener(result);
    });
  }
}
