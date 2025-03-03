import winston from 'winston';

/**
 * @typedef {PushResults}
 * @property {{ imported, updated, deleted, ignored }} counts
 * @property {string[]} errors
 * @property {boolean} wasSuccessful
 * @property {object} data
 */

export class Pusher {
  constructor(models, change, dhisApi, dataBroker) {
    this.models = models;
    this.change = change;
    this.api = dhisApi;
    this.dataBroker = dataBroker;
  }

  get recordId() {
    return this.change.record_id;
  }

  get recordType() {
    return this.change.record_type;
  }

  get changeType() {
    return this.change.type;
  }

  get dataSourceTypes() {
    return this.dataBroker.getDataSourceTypes();
  }

  /**
   * @public
   *
   * @returns {Promise<boolean>}
   */
  async push() {
    try {
      const results = await (this.changeType === 'update' ? this.createOrUpdate() : this.delete());
      await this.logResults(results); // await to avoid db lock between delete/update on event push
      return results.wasSuccessful;
    } catch (error) {
      winston.info('Error while attempting to push to DHIS');
      winston.info(error.stack);
      await this.logResults({ errors: [error.message] });
      return false;
    }
  }

  /**
   * @abstract
   * @protected
   *
   * @returns {Promise<PushResults>}
   */
  async createOrUpdate() {
    throw new Error('Any subclass of Pusher must implement the "createOrUpdate" method');
  }

  /**
   * @abstract
   * @protected
   *
   * @returns {Promise<PushResults>}
   */
  async delete() {
    throw new Error('Any subclass of Pusher must implement the "delete" method');
  }

  async fetchSyncLogRecord() {
    return this.models.dhisSyncLog.findOne({ record_id: this.recordId });
  }

  extractDataFromSyncLog = dhisSyncLog =>
    dhisSyncLog && dhisSyncLog.data ? JSON.parse(dhisSyncLog.data) : null;

  /**
   * @protected
   *
   * @returns {Promise<>}
   * @throws {Error} If the dhis sync log is not found
   */
  async fetchDataFromSyncLog() {
    const dhisSyncLog = await this.fetchSyncLogRecord();
    if (!dhisSyncLog) {
      throw new Error(`Sync log with record_id '${this.recordId}' not found`);
    }

    return this.extractDataFromSyncLog(dhisSyncLog);
  }

  /**
   * @protected
   *
   * @param {PushResults}
   * @returns {Promise<>}
   */
  async logResults({ counts, errors = [], data, reference, references = [] }) {
    const errorString = errors.reduce((allErrors, error) => `${allErrors}\n${error}`, '');
    const logRecord = {
      record_type: this.recordType,
      ...counts,
      error_list: errorString,
      dhis_reference: references.length > 0 ? references[0] : reference, // assume max one reference
    };
    if (data) {
      logRecord.data = JSON.stringify(data);
    }
    await this.models.dhisSyncLog.updateOrCreate(
      {
        record_id: this.recordId,
      },
      logRecord,
    );
  }
}
