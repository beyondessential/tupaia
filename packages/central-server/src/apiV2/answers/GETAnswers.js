import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { GETHandler } from '../GETHandler';
import { assertSurveyResponsePermissions } from '../surveyResponses';
import {
  assertAnswerPermissions,
  createAnswerViaSurveyResponseDBFilter,
} from './assertAnswerPermissions';

/**
 * Handles endpoints:
 * - /answers
 * - /answers/id
 * - /surveyResponses/id/answers
 */
export class GETAnswers extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async findSingleRecord(answerId, options) {
    const answerPermissionsChecker = async accessPolicy =>
      assertAnswerPermissions(accessPolicy, this.models, answerId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, answerPermissionsChecker]),
    );

    return await super.findSingleRecord(answerId, options);
  }

  async getPermissionsFilter(criteria, options) {
    return await this.models.answer.createRecordsPermissionFilter(
      this.accessPolicy,
      criteria,
      options,
    );
  }

  async getPermissionsViaParentFilter(criteria, options) {
    // Check parent permissions
    const surveyResponseChecker = accessPolicy =>
      assertSurveyResponsePermissions(accessPolicy, this.models, this.parentRecordId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponseChecker]),
    );

    // Get answers from survey response
    return createAnswerViaSurveyResponseDBFilter(criteria, options, this.parentRecordId);
  }
}
