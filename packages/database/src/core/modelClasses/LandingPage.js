import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class LandingPageRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.LANDING_PAGE;
}

export class LandingPageModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return LandingPageRecord;
  }
}
