import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ProjectCountryRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.PROJECT_COUNTRY;
}

export class ProjectCountryModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return ProjectCountryRecord;
  }
}
