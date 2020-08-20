/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

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
