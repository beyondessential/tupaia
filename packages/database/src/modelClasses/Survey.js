/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class SurveyType extends DatabaseType {
  static databaseType = TYPES.SURVEY;
}

export class SurveyModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyType;
  }

  async getSurveysBySurveyGroupId(surveyGroupId) {
    return this.find({ survey_group_id: surveyGroupId });
  }
}
