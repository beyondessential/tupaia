/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class AnswerType extends DatabaseType {
  static databaseType = TYPES.ANSWER;
}

export class AnswerModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return AnswerType;
  }
}
