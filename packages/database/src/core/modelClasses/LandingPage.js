import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class LandingPageRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.LANDING_PAGE;
}

export class LandingPageModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return LandingPageRecord;
  }
}
