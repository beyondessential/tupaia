/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DisasterEventType extends DatabaseType {
  static databaseType = TYPES.DISASTER_EVENT;
}

export class DisasterEventModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DisasterEventType;
  }
}
