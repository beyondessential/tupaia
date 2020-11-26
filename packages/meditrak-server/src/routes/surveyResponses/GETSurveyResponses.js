/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import {
  assertSurveyResponsePermissions,
  createSurveyResponseDBFilter,
} from './assertSurveyResponsePermissions';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

/**
 * Handles endpoints:
 * - /surveyResponses
 * - /surveyResponses/:surveyResponseId
 */
export class GETSurveyResponses extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(surveyResponseId, options) {
    const surveyResponse = await super.findSingleRecord(surveyResponseId, options);

    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, surveyResponseId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    return surveyResponse;
  }

  async findRecords(criteria, options) {
    const { dbConditions, dbOptions } = await createSurveyResponseDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      options,
    );
    const surveyResponses = await super.findRecords(dbConditions, dbOptions);

    return surveyResponses;
  }
}
