/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class QuestionType extends DatabaseType {
  static databaseType = TYPES.QUESTION;
}

export class QuestionModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return QuestionType;
  }
}
