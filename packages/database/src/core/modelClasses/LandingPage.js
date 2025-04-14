import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class LandingPageRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.LANDING_PAGE;
}

export class LandingPageModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return LandingPageRecord;
  }
}
