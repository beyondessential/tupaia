/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { TYPES } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { mergeFilter, mergeMultiJoin } from '../utilities';
import {
  assertSurveyEditPermissions,
  assertSurveyGetPermissions,
  createSurveyDBFilter,
} from '../surveys/assertSurveyPermissions';

export const assertSurveyScreenComponentGetPermissions = async (
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
  const surveyId = await surveyScreenComponent.surveyId();
  return assertSurveyGetPermissions(accessPolicy, models, surveyId);
};

export const assertSurveyScreenComponentEditPermissions = async (
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
  const surveyId = await surveyScreenComponent.surveyId();
  return assertSurveyEditPermissions(accessPolicy, models, surveyId);
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
    dbConditions['survey_screen.survey_id'] = surveyId;
  } else if (!hasBESAdminAccess(accessPolicy)) {
    // If we have BES admin, don't bother filtering by survey
    const surveyConditions = await createSurveyDBFilter(accessPolicy, models);
    const permittedSurveys = await models.survey.find(surveyConditions);
    const permittedSurveyIds = permittedSurveys.map(s => s.id);
    dbConditions['survey_screen.survey_id'] = mergeFilter(
      permittedSurveyIds,
      dbConditions['survey_screen.survey_id'],
    );
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
