/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertSurveyPermissions,
  createSurveyDBFilter,
  createSurveyViaCountryDBFilter,
} from './assertSurveyPermissions';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

/**
 * Handles endpoints:
 * - /surveys
 * - /survey/id
 * - /country/id/surveys
 */

export class GETSurveys extends GETHandler {
  assertUserHasAccess() {
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(surveyId, options) {
    const survey = await super.findSingleRecord(surveyId, options);

    const surveyChecker = accessPolicy =>
      assertSurveyPermissions(accessPolicy, this.models, surveyId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, surveyChecker]));

    return survey;
  }

  async findRecords(criteria, options) {
    if (this.parentRecordId) {
      return this.findRecordsViaParent(criteria, options);
    }

    const dbConditions = await createSurveyDBFilter(this.accessPolicy, this.models, criteria);
    return super.findRecords(dbConditions, options);
  }

  async findRecordsViaParent(criteria, options) {
    const dbConditions = await createSurveyViaCountryDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      this.parentRecordId,
    );
    return super.findRecords(dbConditions, options);
  }
}
