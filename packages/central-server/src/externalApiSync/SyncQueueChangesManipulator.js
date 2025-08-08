const UPDATE = 'update';
const DELETE = 'delete';

export class SyncQueueChangesManipulator {
  constructor(models) {
    this.models = models;
  }

  getRecordIds = changes => changes.map(c => c.record_id);

  getChangesOfType = (changes, type) => changes.filter(c => c.type === type);

  getDeleteChanges = changes => this.getChangesOfType(changes, DELETE);

  getUpdateChanges = changes => this.getChangesOfType(changes, UPDATE);

  getChangesForRecordType = (changes, recordType) =>
    changes.filter(c => c.record_type === recordType);

  getIdsFromChangesForModel = (changes, model) =>
    this.getRecordIds(this.getChangesForRecordType(changes, model.databaseRecord));

  getRecords = changes =>
    changes.map(change => {
      const { old_record: oldRecord, new_record: newRecord, type } = change;
      return type === DELETE ? oldRecord : newRecord;
    });

  getRecordsFromChangesForModel = (changes, model) =>
    this.getRecords(this.getChangesForRecordType(changes, model.databaseRecord));
}
