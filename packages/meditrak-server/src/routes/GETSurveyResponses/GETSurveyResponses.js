/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertSurveyResponsePermissions,
  filterSurveyResponsesByPermissions,
} from './assertSurveyResponsePermissions';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

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
    const surveyResponse = await super.findSingleRecord(surveyResponseId, options);

    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, surveyResponse);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    return surveyResponse;
  }

  async findRecords(criteria, options) {
    const surveyResponses = await super.findRecords(criteria, options);
    const filteredResponses = await filterSurveyResponsesByPermissions(
      this.req.accessPolicy,
      surveyResponses,
      this.models,
    );

    if (!filteredResponses.length) {
      throw new Error('Your permissions do not allow access to any of the requested resources');
    }

    return filteredResponses;
  }
}
