import { AnalyticsRefresher, SurveyResponseModel } from '@tupaia/database';
import { respond } from '@tupaia/utils';
import { ANSWER_BODY_PARSERS } from '../../dataAccessors';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { RouteHandler } from '../RouteHandler';

export class SubmitSurveyResponses extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    const { body } = req;
    this.surveyResponses = Array.isArray(body) ? body : [body];
  }

  async assertUserHasAccess(transactingModels) {
    // Check permissions
    const surveyResponsePermissionsChecker = async accessPolicy => {
      await transactingModels.surveyResponse.assertCanSubmit(
        transactingModels,
        accessPolicy,
        this.surveyResponses,
      );
    };
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionsChecker]),
    );
  }

  async handle() {
    const { userId } = this.req;
    const { submitAsPublic, waitForAnalyticsRebuild } = this.query;

    let submitterId = userId;
    if (submitAsPublic) {
      const user = await this.models.user.findPublicUser();
      submitterId = user.id;
    }

    let results = [];

    await this.models.wrapInTransaction(async transactingModels => {
      await this.assertUserHasAccess(transactingModels);
      // Upsert entities and options that were created in user's local database
      await SurveyResponseModel.upsertEntitiesAndOptions(transactingModels, this.surveyResponses);
      await SurveyResponseModel.validateSurveyResponses(transactingModels, this.surveyResponses);
      results = await SurveyResponseModel.saveResponsesToDatabase(
        transactingModels,
        submitterId,
        this.surveyResponses,
        ANSWER_BODY_PARSERS,
      );

      if (waitForAnalyticsRebuild) {
        const { database } = transactingModels;
        await AnalyticsRefresher.refreshAnalytics(database);
      }
    });

    respond(this.res, { count: this.surveyResponses.length, results });
  }
}
