/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { DatabaseModel } from '../DatabaseModel';

export class DhisInstanceType extends DatabaseType {
  static databaseType = TYPES.DHIS_INSTANCE;
}

export class DhisInstanceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DhisInstanceType;
  }
}
