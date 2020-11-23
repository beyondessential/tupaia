/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnswerPermissions, createAnswerDBFilter } from './assertAnswerPermissions';
import { assertSurveyResponsePermissions } from '../surveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

/**
 * Handles endpoints:
 * - /answer
 * - /answers/id
 * - /surveyReponses/id/answers
 */

export class GETAnswers extends GETHandler {
  async findSingleRecord(answerId, options) {
    const answer = await super.findSingleRecord(answerId, options);

    const answerPermissionsChecker = accessPolicy =>
      assertAnswerPermissions(accessPolicy, this.models, answerId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, answerPermissionsChecker]),
    );

    return answer;
  }

  async findRecords(criteria, options) {
    const { dbConditions, dbOptions } = await createAnswerDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      options,
    );
    return super.findRecords(dbConditions, dbOptions);
  }

  async findRecordsViaParent(criteria, options) {
    // Check parent permissions
    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    // Get answers from survey response
    const dbConditions = { ...criteria };
    dbConditions.survey_response_id = this.parentRecordId;

    return super.findRecords(dbConditions, options);
  }
}
