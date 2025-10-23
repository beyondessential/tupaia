import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

/** Sometimes referred to as ‘clinic’. */
export class FacilityRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.FACILITY;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  get categoryCode() {
    return this.category_code;
  }

  async geographicalArea() {
    return await this.otherModels.geographicalArea.findById(this.geographical_area_id);
  }

  async country() {
    return await this.otherModels.country.findById(this.country_id);
  }

  async entity() {
    return await this.otherModels.entity.findOne({ code: this.code });
  }
}

export class FacilityModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return FacilityRecord;
  }
}
