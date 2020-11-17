/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';
import { assertAnswerPermissions, createAnswerDBFilter } from './assertAnswerPermissions';
import { assertSurveyResponsePermissions } from '../GETSurveyResponses';
import { findAnswersInSurveyResponse } from '../../dataAccessors';
import { allowNoPermissions, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

/**
 * Handles endpoints:
 * - /answer
 * - /answers/id
 * - /surveyReponses/id/answers
 */

export class GETAnswers extends GETHandler {
  assertUserHasAccess() {
    return this.assertPermissions(allowNoPermissions);
  }

  async findSingleRecord(answerId, options) {
    const answer = await super.findSingleRecord(answerId, options);

    const answerChecker = accessPolicy =>
      assertAnswerPermissions(accessPolicy, this.models, answerId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, answerChecker]));

    return answer;
  }

  async findRecords(criteria, options) {
    if (this.parentRecordId) {
      return this.findRecordsViaParent(criteria, options);
    }

    const { dbConditions, dbOptions } = await createAnswerDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
      options,
    );
    const answers = await super.findRecords(dbConditions, dbOptions);
    return answers;
  }

  async findRecordsViaParent(criteria, options) {
    // Check parent permissions
    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    // Get answers from survey response
    return findAnswersInSurveyResponse(this.models, this.parentRecordId, criteria, options);
  }
}
