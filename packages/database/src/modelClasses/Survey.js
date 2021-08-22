/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export const PERIOD_GRANULARITIES = {
  YEARLY: 'yearly',
  QUARTERLY: 'quarterly',
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  DAILY: 'daily',
};

export const PERIOD_GRANULARITY_TO_MOMENT_UNIT = {
  [PERIOD_GRANULARITIES.YEARLY]: 'year',
  [PERIOD_GRANULARITIES.QUARTERLY]: 'quarter',
  [PERIOD_GRANULARITIES.MONTHLY]: 'month',
  [PERIOD_GRANULARITIES.WEEKLY]: 'isoWeek',
  [PERIOD_GRANULARITIES.DAILY]: 'day',
};

class SurveyType extends DatabaseType {
  static databaseType = TYPES.SURVEY;
}

export class SurveyModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return SurveyType;
  }
}
