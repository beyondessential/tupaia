/**
 * Maintains the internal queue of changes to be synced: queues changes, provides them when asked,
 * and removes them when marked as used. First changed first out, i.e. the oldest changes are synced
 * first.
 */
export class ChangeQueue {
  constructor(database) {
    this.database = database;
  }

  /**
   * Enqueue a change. Must be called from within a database.write transaction
   * @param  {string} action     The action that caused the change, e.g. 'SubmitSurvey'
   * @param  {string} recordId   Id of main record affected by the change (may imply child records)
   * @return {none}
   */
  push(action, recordId) {
    if (!recordId)
      throw new Error('Cannot push a change without a record id onto the change queue');
    const duplicate =
      this.database.objects('Change').filtered('action == $0 && recordId == $1', action, recordId)
        .length > 0;
    if (!duplicate) {
      this.database.create('Change', {
        timestamp: Date.now(),
        action,
        recordId,
      });
    }
  }

  /**
   * Return the number of records in the change queue.
   * @return {integer} Number of changes awaiting sync
   */
  get length() {
    return this.database.objects('Change').length;
  }

  /**
   * Return the next changes with a maximum total data size
   * @param  {integer}   threshold The limit of data (in KB)
   * @return {array}     An array of the top changes in the queue within that threshold
   *                     or with one record in excess.
   */
  async nextWithinThreshold(threshold) {
    const allChanges = this.database.objects('Change').sorted('timestamp');
    const changesWithinThreshold = [];
    let size = 0;
    for (const change of allChanges) {
      const record = await change.generateSyncJson(this.database);
      const currentRecordSize = JSON.stringify(record).length;
      if (size + currentRecordSize > threshold && changesWithinThreshold.length > 0) {
        // threshold is breached and at least one record
        break;
      }
      size += currentRecordSize;
      changesWithinThreshold.push({ change, payload: record });
      const { action } = change;
      if (action === 'AddSurveyFile') {
        // If our files are quite large, and we load another one to see if it crosses our threshold,
        // the Android app might run out of memory and crash. The workaround is to only ever
        // upload one file at a time.
        break;
      }
    }
    return changesWithinThreshold;
  }

  /**
   * Remove the given changes from the sync queue.
   * @param  {array} changes An array of the changes that have been used
   * @return {none}
   */
  use(changes) {
    this.database.write(() => {
      this.database.delete('Change', changes);
    });
  }
}
