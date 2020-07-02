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

  async dataGroup() {
    return this.otherModels.dataSource.findById(this.data_source_id);
  }

  async getPermissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }
}

export class SurveyModel extends DatabaseModel {
  notifiers = [onChangeUpdateDataGroup];

  get DatabaseTypeClass() {
    return SurveyType;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  isDeletableViaApi = true;
}

const onChangeUpdateDataGroup = async ({ type: changeType, record }, models) => {
  const { code, data_source_id: dataSourceId } = record;

  switch (changeType) {
    case 'update':
      return models.dataSource.updateById(dataSourceId, { code });
    case 'delete':
      return models.dataSource.deleteById(dataSourceId);
    default:
      return true;
  }
};
