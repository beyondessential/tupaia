/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { SurveyGroupModel as CommonSurveyGroupModel } from '@tupaia/database';

export class SurveyGroupModel extends CommonSurveyGroupModel {
  meditrakConfig = {
    minAppVersion: '1.6.69',
  };
}
