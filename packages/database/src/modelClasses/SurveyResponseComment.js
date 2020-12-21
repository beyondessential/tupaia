/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class AlertCommentType extends DatabaseType {
  static databaseType = TYPES.ALERT_COMMENT;
}

export class AlertCommentModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return AlertCommentType;
  }
}
