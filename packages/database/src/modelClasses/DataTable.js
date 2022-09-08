/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

const DATA_TABLE_TYPES = {
  INTERNAL: 'internal',
};

class DataTableType extends DatabaseType {
  static databaseType = TYPES.DATA_TABLE;
}

export class DataTableModel extends DatabaseModel {
  DATA_TABLE_TYPES = DATA_TABLE_TYPES;

  get DatabaseTypeClass() {
    return DataTableType;
  }
}
