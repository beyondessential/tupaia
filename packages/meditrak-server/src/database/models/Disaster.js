/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class DisasterType extends DatabaseType {
  static databaseType = TYPES.DISASTER;
}

export class DisasterModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DisasterType;
  }
}
