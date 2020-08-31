/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { keyBy } from 'lodash';
import BES_ADMIN_PERMISSION_GROUP from '../../permissions/constants';

export const hasSurveyResponsePermissions = async (accessPolicy, models, surveyResponse) => {
  const entity = await models.entity.findById(surveyResponse.entity_id);
  const survey = await models.survey.findById(surveyResponse.survey_id);
  const permissionGroup = await models.permissionGroup.findById(survey.permission_group_id);

  return accessPolicy.allows(entity.country_code, permissionGroup.name);
};

export const assertSurveyResponsePermissions = async (accessPolicy, models, surveyResponse) => {
  const hasPermission = await hasSurveyResponsePermissions(accessPolicy, models, surveyResponse);
  if (!hasPermission) {
    throw new Error('You do not have permissions for this survey response');
  }
  return true;
};

export const filterSurveyResponsesByPermissions = async (accessPolicy, surveyResponses, models) => {
  if (accessPolicy.allowsSome(null, BES_ADMIN_PERMISSION_GROUP)) {
    return surveyResponses;
  }
  const entities = await models.entity.findManyById(surveyResponses.map(sr => sr.entity_id));
  const surveys = await models.survey.findManyById(surveyResponses.map(sr => sr.survey_id));
  const permissionGroups = await models.permissionGroup.findManyById(
    surveys.map(s => s.permission_group_id),
  );

  const entitiesById = keyBy(entities, 'id');
  const surveysById = keyBy(surveys, 'id');
  const permissionGroupsById = keyBy(permissionGroups, 'id');

  const filteredSurveyResponses = surveyResponses.filter(surveyResponse => {
    const entity = entitiesById[surveyResponse.entity_id];
    const survey = surveysById[surveyResponse.survey_id];
    const permissionGroup = permissionGroupsById[survey.permission_group_id];

    return accessPolicy.allows(entity.country_code, permissionGroup.name);
  });

  return filteredSurveyResponses;
};
