import { AnalyticsRefresher } from '@tupaia/database';
import { respond, ValidationError } from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { ACTIONS, CHANGE_HANDLERS } from './changeHandlers';

// TODO: Tidy this up as part of RN-502

/**
 * Responds to POST requests to the /changes endpoint, integrating the data posted in the request
 * body according to the action types causing the changes
 * @param {object}  event    - event data (e.g. url, query parameters, body)
 * @param {object}  context  - runtime info (Lambda metadata)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function postChanges(req, res) {
  const changes = req.body;
  if (!Array.isArray(changes)) {
    throw new ValidationError('Request body must be an array of changes');
  }
  const translatedChanges = [];

  await req.models.wrapInTransaction(async transactingModels => {
    for (const change of changes) {
      const { action, payload, ...rest } = change ?? {};
      const changeHandler = CHANGE_HANDLERS.get(action);
      if (changeHandler === undefined) {
        throw new ValidationError(`${action} is not a supported change action`);
      }
      const { translate, validate, handle } = changeHandler;
      const translatedPayload = await translate(transactingModels, payload);
      await validate(transactingModels, translatedPayload);
      translatedChanges.push({ ...rest, action, translatedPayload, handle });
    }

    // Check permissions for survey responses
    const surveyResponsePayloads = translatedChanges
      .filter(c => c.action === ACTIONS.SubmitSurveyResponse)
      .map(c => c.translatedPayload.survey_response || c.translatedPayload);
    const surveyResponsePermissionsChecker = async accessPolicy => {
      await transactingModels.surveyResponse.assertCanSubmit(
        transactingModels,
        accessPolicy,
        surveyResponsePayloads,
      );
    };
    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionsChecker]),
    );

    for (const { action, translatedPayload, handle, ...rest } of translatedChanges) {
      await handle(transactingModels, translatedPayload);

      if (action === ACTIONS.SubmitSurveyResponse) {
        // TODO: Rework this functionality, as directly calling an analytics refresh here is both inefficient
        // and may create duplicate records in the analytics table
        const { waitForAnalyticsRebuild } = rest;
        if (waitForAnalyticsRebuild) {
          const { database } = transactingModels;
          await AnalyticsRefresher.refreshAnalytics(database);
        }
      }
    }
  });

  respond(res, { message: 'Successfully integrated changes into server database' });
}
