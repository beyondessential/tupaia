/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { DatabaseModel } from '../DatabaseModel';

export class SupersetInstanceType extends DatabaseType {
  static databaseType = TYPES.SUPERSET_INSTANCE;
}

export class SupersetInstanceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SupersetInstanceType;
  }
}
