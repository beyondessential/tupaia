import { SyncQueueChangesManipulator } from './SyncQueueChangesManipulator';

export class ChangeValidator extends SyncQueueChangesManipulator {
  filterChangesWithMatchingIds = (changes, validIds) => {
    const validIdSet = new Set(validIds);
    return changes.filter(c => validIdSet.has(c.record_id));
  };

  getPreviouslySyncedDeletes = async (changes, ...modelsToCheck) => {
    // If there is a sync log or queue record with this record_id, the delete record must be
    // valid for the dhis sync queue
    const deleteChanges = this.getDeleteChanges(changes);
    if (deleteChanges.length === 0) return [];
    const recordIds = this.getRecordIds(deleteChanges);
    const validDeleteIds = [];
    await Promise.all(
      modelsToCheck.map(async model => {
        const previouslySynced = await model.find({ record_id: recordIds });
        validDeleteIds.push(...previouslySynced.map(r => r.record_id));
      }),
    );
    return this.filterChangesWithMatchingIds(changes, validDeleteIds);
  };

  /**
   * @abstract
   */
  getValidUpdates() {}
}
