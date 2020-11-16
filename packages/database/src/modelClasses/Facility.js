/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class FacilityType extends DatabaseType {
  static databaseType = TYPES.FACILITY;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  get categoryCode() {
    return this.category_code;
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
}
