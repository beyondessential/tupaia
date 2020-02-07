/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class SurveyScreenComponentType extends DatabaseType {
  static databaseType = TYPES.SURVEY_SCREEN_COMPONENT;
}

export class SurveyScreenComponentModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyScreenComponentType;
  }
}
