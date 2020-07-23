/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class AlertType extends DatabaseType {
  static databaseType = TYPES.ALERT;
}

export class AlertModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return AlertType;
  }
}
