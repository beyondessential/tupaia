import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ProjectCountryRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.PROJECT_COUNTRY;
}

export class ProjectCountryModel extends DatabaseModel {
  // TUP-3068 (next PR in the stack) wires this into the sync pipeline alongside the
  // matching schema column + test fixture seed. Left as DO_NOT_SYNC here so this PR
  // ships a sync-clean state without the supporting infrastructure.
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return ProjectCountryRecord;
  }
}
