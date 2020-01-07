/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';

class SurveyScreenComponentType extends DatabaseType {
  static databaseType = TYPES.SURVEY_SCREEN_COMPONENT;

  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}

export class SurveyScreenComponentModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyScreenComponentType;
  }
}
