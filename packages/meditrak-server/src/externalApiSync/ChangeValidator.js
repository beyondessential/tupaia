/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const UPDATE = 'update';
const DELETE = 'delete';

export class ChangeValidator {
  constructor(models) {
    this.models = models;
  }

  getRecordIds = changes => changes.map(c => c.record_id);

  getChangesOfType = (changes, type) => changes.filter(c => c.type === type);

  getDeleteChanges = changes => this.getChangesOfType(changes, DELETE);

  getUpdateChanges = changes => this.getChangesOfType(changes, UPDATE);

  filterChangesWithMatchingIds = (changes, validIds) => {
    const validIdSet = new Set(validIds);
    return changes.filter(c => validIdSet.has(c.record_id));
  };

  getPreviouslySyncedDeletes = async (changes, modelsToCheck) => {
    // If there is a sync log or queue record with this record_id, the delete record must be
    // valid for the dhis sync queue
    const deleteChanges = this.getDeleteChanges(changes);
    const recordIds = this.getRecordIds(deleteChanges);
    const validDeleteIds = [];
    await Promise.all(
      modelsToCheck.forEach(async model => {
        const previouslySynced = await model.find({ record_id: recordIds });
        validDeleteIds.push(previouslySynced.map(r => r.record_id));
      }),
    );
    return this.filterChangesWithMatchingIds(changes, validDeleteIds);
  };

  /**
   * @abstract
   */
  getValidUpdates() {}
}
