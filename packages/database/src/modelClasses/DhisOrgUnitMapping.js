/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class DhisOrgUnitMappingType extends DatabaseType {
  static databaseType = TYPES.DHIS_ORG_UNIT_MAPPING;
}

export class DhisOrgUnitMappingModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DhisOrgUnitMappingType;
  }
}
