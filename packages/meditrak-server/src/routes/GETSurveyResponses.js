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
}
