/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { AnalyticsRefresher } from '@tupaia/database';
import { assertCanSubmitSurveyResponses } from '../import/importSurveyResponses/assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { saveResponsesToDatabase } from '.';
import { upsertEntitiesAndOptions } from './upsertEntitiesAndOptions';
import { validateSurveyResponses } from './validateSurveyResponses';

export async function surveyResponse(req, res) {
  const { userId, body, query, models } = req;
  const { submitAsPublic } = query;

  let submitterId = userId;
  if (submitAsPublic) {
    const user = await models.user.findPublicUser();
    submitterId = user.id;
  }

  let results = [];
  const responses = Array.isArray(body) ? body : [body];
  // Upsert entities and options that were created in user's local database
  await upsertEntitiesAndOptions(models, responses);

  await models.wrapInTransaction(async transactingModels => {
    await validateSurveyResponses(transactingModels, responses);
    // Check permissions
    const surveyResponsePermissionsChecker = async accessPolicy => {
      await assertCanSubmitSurveyResponses(accessPolicy, transactingModels, responses);
    };
    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionsChecker]),
    );

    results = await saveResponsesToDatabase(transactingModels, submitterId, responses);

    if (req.query.waitForAnalyticsRebuild) {
      const { database } = transactingModels;
      await AnalyticsRefresher.refreshAnalytics(database);
    }
  });
  res.send({ count: responses.length, results });
}
