/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TYPES } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { mergeMultiJoin } from '../utilities';
import {
  assertSurveyPermissions,
  createSurveyDBFilter,
} from '../GETSurveys/assertSurveyPermissions';

export const assertSurveyScreenComponentPermissions = async (
  accessPolicy,
  models,
  surveyScreenComponentId,
) => {
  const surveyScreenComponent = await models.surveyScreenComponent.findById(
    surveyScreenComponentId,
  );
  if (!surveyScreenComponent) {
    throw new Error(`No surveyScreenComponent exists with id ${surveyScreenComponentId}`);
  }

  // Pull the survey from the survey screen, then run the survey permissions check
  const surveyScreen = await models.surveyScreen.findById(surveyScreenComponent.screen_id);
  return assertSurveyPermissions(accessPolicy, models, surveyScreen.survey_id);
};

export const createSurveyScreenComponentDBFilter = async (
  accessPolicy,
  models,
  criteria,
  options,
  surveyId,
) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (surveyId) {
    dbConditions.survey_id = surveyId;
  } else if (!hasBESAdminAccess(accessPolicy)) {
    // If we have BES admin, don't bother filtering by survey
    const surveyConditions = await createSurveyDBFilter(accessPolicy, models);
    const permittedSurveys = await models.survey.find(surveyConditions);
    const permittedSurveyIds = permittedSurveys.map(s => s.id);
    dbConditions.survey_id = permittedSurveyIds;
  }

  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: TYPES.QUESTION,
        joinCondition: [`${TYPES.QUESTION}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.question_id`],
      },
      {
        joinWith: TYPES.SURVEY_SCREEN,
        joinCondition: [`${TYPES.SURVEY_SCREEN}.id`, `${TYPES.SURVEY_SCREEN_COMPONENT}.screen_id`],
      },
    ],
    dbOptions.multiJoin,
  );

  return { dbConditions, dbOptions };
};
