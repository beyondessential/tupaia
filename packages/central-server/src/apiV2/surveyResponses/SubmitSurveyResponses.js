import { AnalyticsRefresher } from '@tupaia/database';
import { respond } from '@tupaia/utils';
import { assertCanSubmitSurveyResponses } from '../import/importSurveyResponses/assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { saveResponsesToDatabase } from '.';
import { upsertEntitiesAndOptions } from './upsertEntitiesAndOptions';
import { validateSurveyResponses } from './validateSurveyResponses';
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
      await assertCanSubmitSurveyResponses(accessPolicy, transactingModels, this.surveyResponses);
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
      // Upsert entities and options that were created in user's local database
      await upsertEntitiesAndOptions(transactingModels, this.surveyResponses);
      await validateSurveyResponses(transactingModels, this.surveyResponses);
      await this.assertUserHasAccess(transactingModels);
      results = await saveResponsesToDatabase(transactingModels, submitterId, this.surveyResponses);

      if (waitForAnalyticsRebuild) {
        const { database } = transactingModels;
        await AnalyticsRefresher.refreshAnalytics(database);
      }
    });

    respond(this.res, { count: this.surveyResponses.length, results });
  }
}
