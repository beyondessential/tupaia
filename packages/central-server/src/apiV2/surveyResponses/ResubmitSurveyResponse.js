/* eslint-disable camelcase */
import { SurveyResponseModel } from '@tupaia/database';
import { respond } from '@tupaia/utils';
import {
  assertAdminPanelAccess,
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { assertCanSubmitSurveyResponses } from '../import/importSurveyResponses/assertCanImportSurveyResponses';
import { RouteHandler } from '../RouteHandler';
import { assertSurveyResponsePermissions } from './assertSurveyResponsePermissions';
import { saveResponsesToDatabase } from './saveResponsesToDatabase';

/**
 * Handles POST endpoint:
 * - /surveyResponses/:surveyResponseId/resubmit
 *
 * Creates a new survey response and flags the previous one as `outdated=true`
 */

export class ResubmitSurveyResponse extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    this.originalSurveyResponseId = this.params.recordId;
    this.newSurveyResponse = req.body;
  }

  async assertUserHasAccess() {
    await this.models.wrapInReadOnlyTransaction(async transactingModels => {
      // Check the user has either:
      // - BES admin access
      // - Tupaia Admin Panel access AND permission to view the surveyResponse AND permission to submit the new survey response
      const originalSurveyResponsePermissionChecker = accessPolicy =>
        assertSurveyResponsePermissions(
          accessPolicy,
          transactingModels,
          this.originalSurveyResponseId,
        );

      const newSurveyResponsePermissionsChecker = async accessPolicy => {
        await assertCanSubmitSurveyResponses(accessPolicy, transactingModels, [
          this.newSurveyResponse,
        ]);
      };

      await this.assertPermissions(
        assertAnyPermissions([
          assertBESAdminAccess,
          assertAllPermissions([
            assertAdminPanelAccess,
            originalSurveyResponsePermissionChecker,
            newSurveyResponsePermissionsChecker,
          ]),
        ]),
      );
    });
  }

  async handleRequest() {
    // Upsert entities and options that were created in user's local database
    const originalSurveyResponse = await this.models.surveyResponse.findById(
      this.originalSurveyResponseId,
    );
    if (!originalSurveyResponse) {
      throw new Error(
        `Cannot find original survey response with id: ${this.originalSurveyResponseId}`,
      );
    }

    await this.models.wrapInTransaction(async transactingModels => {
      await SurveyResponseModel.upsertEntitiesAndOptions(transactingModels, [
        this.newSurveyResponse,
      ]);
      await SurveyResponseModel.validateSurveyResponse(transactingModels, this.newSurveyResponse);
      await this.assertUserHasAccess();
      await saveResponsesToDatabase(transactingModels, originalSurveyResponse.user_id, [
        this.newSurveyResponse,
      ]);
      await transactingModels.surveyResponse.updateById(this.originalSurveyResponseId, {
        outdated: true,
      });
    });

    respond(this.res, { message: 'Successfully resubmitted the response' });
  }
}
