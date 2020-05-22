/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class SurveyType extends DatabaseType {
  static databaseType = TYPES.SURVEY;

  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  async getPermissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  getIsIntegratedWithDhis2() {
    return !!this.integration_metadata.dhis2;
  }

  getIsDataForRegionalDhis2() {
    if (!this.integration_metadata.dhis2) {
      throw new Error('This survey is not meant for DHIS2 at all');
    }
    return this.integration_metadata.dhis2.isDataRegional;
  }
}

export class SurveyModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyType;
  }

  isDeletableViaApi = true;
}
