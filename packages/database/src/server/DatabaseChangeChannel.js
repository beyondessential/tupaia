import PGPubSub from 'pg-pubsub';
import winston from 'winston';

import { generateId } from '../core/utilities/generateId';
import { getConnectionConfig } from './getConnectionConfig';

export class DatabaseChangeChannel extends PGPubSub {
  constructor() {
    super(getConnectionConfig(), { log: winston.info });
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

  async publishRecordUpdates(recordType, records, specificHandlerKey) {
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      await this.publish('change', {
        record_id: record.id,
        type: 'update',
        record_type: recordType,
        handler_key: specificHandlerKey,
        old_record: record,
        new_record: record,
      });
    }
  }

  /**
   * Sends a ping request out to the database and listens for a response
   * @param {number} timeout - default 250ms
   * @param {number} retries - default 240 (i.e. 1 minute total wait time). Set to 0 for unlimited retries
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
        if (retries === 0 || tries < retries) {
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
