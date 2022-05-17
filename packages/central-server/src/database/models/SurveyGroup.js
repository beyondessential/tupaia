/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class SurveyGroupType extends DatabaseType {
  static databaseType = TYPES.SURVEY_GROUP;
}

export class SurveyGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyGroupType;
  }

  meditrakConfig = {
    minAppVersion: '1.6.69',
  };
}
