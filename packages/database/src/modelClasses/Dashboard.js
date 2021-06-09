/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DashboardType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD;
}

export class DashboardModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardType;
  }

  async getDashboards(entity, hierarchyId, params) {
    const ancestorCodes = await entity.getAncestorCodes(hierarchyId);
    const entityCodes = [...ancestorCodes, entity.code];
    return this.find({
      root_entity_code: entityCodes,
      ...params,
    });
  }
}
