/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class SurveyType extends DatabaseType {
  static databaseType = TYPES.SURVEY;
}

export class SurveyModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return SurveyType;
  }
}
