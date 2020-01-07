/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { DatabaseModel } from '../DatabaseModel';
import { TYPES } from '..';

class SurveyGroupType extends DatabaseType {
  static databaseType = TYPES.SURVEY_GROUP;

  static meditrakConfig = {
    minAppVersion: '1.6.68',
  };
}

export class SurveyGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyGroupType;
  }
}
