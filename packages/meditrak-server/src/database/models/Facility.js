/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class FacilityType extends DatabaseType {
  static databaseType = TYPES.FACILITY;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  async geographicalArea() {
    return this.otherModels.geographicalArea.findById(this.geographical_area_id);
  }

  async country() {
    return this.otherModels.country.findById(this.country_id);
  }

  async entity() {
    return this.otherModels.entity.findOne({ code: this.code });
  }
}

export class FacilityModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return FacilityType;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}
