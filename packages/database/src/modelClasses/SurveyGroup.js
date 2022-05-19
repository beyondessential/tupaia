/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class SurveyGroupType extends DatabaseType {
  static databaseType = TYPES.SURVEY_GROUP;
}

export class SurveyGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyGroupType;
  }
}
