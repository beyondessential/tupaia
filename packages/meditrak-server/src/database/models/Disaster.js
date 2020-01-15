/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';
import { DatabaseModel } from '../DatabaseModel';

class DisasterType extends DatabaseType {
  static databaseType = TYPES.DISASTER;
}

export class DisasterModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DisasterType;
  }
}
