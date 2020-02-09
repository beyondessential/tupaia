/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType, TYPES, DatabaseModel } from '@tupaia/database';

class DisasterEventType extends DatabaseType {
  static databaseType = TYPES.DISASTER_EVENT;
}

export class DisasterEventModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DisasterEventType;
  }
}
