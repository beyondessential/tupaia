/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { DatabaseModel } from '../DatabaseModel';
import { TYPES } from '..';

class OptionSetType extends DatabaseType {
  static databaseType = TYPES.OPTION_SET;

  static meditrakConfig = {
    minAppVersion: '1.7.92',
  };
}

export class OptionSetModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return OptionSetType;
  }
}
