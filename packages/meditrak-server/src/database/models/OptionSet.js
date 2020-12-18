/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class OptionSetType extends DatabaseType {
  static databaseType = TYPES.OPTION_SET;
}

export class OptionSetModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return OptionSetType;
  }

  meditrakConfig = {
    minAppVersion: '1.7.92',
  };
}
