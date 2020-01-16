/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class SurveyScreenType extends DatabaseType {
  static databaseType = TYPES.SURVEY_SCREEN;
}

export class SurveyScreenModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyScreenType;
  }
}
