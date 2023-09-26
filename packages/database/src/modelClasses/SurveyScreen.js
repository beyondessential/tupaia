/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class SurveyScreenType extends DatabaseType {
  static databaseType = TYPES.SURVEY_SCREEN;
}

export class SurveyScreenModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyScreenType;
  }
}
