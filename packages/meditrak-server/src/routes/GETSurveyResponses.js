/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from './GETHandler';
import {
  allowNoPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertSurveyResponsePermissions,
  hasSurveyResponsePermissions,
} from '../permissions';

/**
 * Handles endpoints:
 * - /surveyResponse
 * - /surveyResponse/:surveyResponseId
 */
export class GETSurveyResponses extends GETHandler {
  async assertUserHasAccess() {
    // Is there a way to check they have any permission group that may contain survey responses?
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(surveyResponseId, options) {
    const surveyResponse = await this.database.findOne(
      this.recordType,
      { [`${this.recordType}.id`]: surveyResponseId },
      options,
    );

    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, surveyResponse);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    return surveyResponse;
  }

  async findRecords(criteria, options) {
    const surveyResponsePermissionFilter = surveyResponse =>
      hasSurveyResponsePermissions(this.req.accessPolicy, this.models, surveyResponse);

    const surveyResponses = await this.database.find(this.recordType, criteria, options);
    const permissionResults = await Promise.all(
      surveyResponses.map(surveyResponsePermissionFilter),
    );
    const filteredResponses = surveyResponses.filter((_, index) => permissionResults[index]);

    if (!filteredResponses.length) {
      throw new Error('Your permissions do not allow access to any of the requested resources');
    }

    return filteredResponses;
  }
}
