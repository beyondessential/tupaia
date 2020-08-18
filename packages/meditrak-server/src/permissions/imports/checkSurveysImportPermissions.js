/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import keyBy from 'lodash.keyby';

import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../constants';

export const checkSurveysImportPermissions = async (
  accessPolicy,
  models,
  surveyNames,
  newCountryIds,
) => {
  const surveys = models.survey.find({
    name: surveyNames,
  });
  const nameToSurvey = keyBy(surveys, 'name');
  let newCountryEntities = [];

  //If countries are selected when import surveys, it will update the country_ids of the survey
  //So we need to check if the user has TUPAIA_ADMIN_PANEL_PERMISSION_GROUP to the new specified countries for the surveys
  if (newCountryIds) {
    newCountryEntities = await models.entity.find({
      id: newCountryIds,
    });

    if (!accessPolicy.allowsSome(newCountryEntities, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      return false;
    }
  } else if (!accessPolicy.allowsSome(null, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
    return false;
  }

  for (const surveyName of surveyNames) {
    const survey = nameToSurvey[surveyName];

    //For existing surveys, check if we have permission TUPAIA_ADMIN_PANEL_PERMISSION_GROUP and also
    //the survey permission group. If don't have any of them, mark as fail
    if (survey) {
      const surveyCountryEntities = await models.entity.find({
        id: survey.country_ids,
      });
      const surveyPermissionGroup = await models.permissionGroup.findOne({
        id: survey.permission_group_id,
      });

      if (
        !accessPolicy.allowsSome(surveyCountryEntities, surveyPermissionGroup.name) ||
        !accessPolicy.allowsSome(surveyCountryEntities, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)
      ) {
        return false;
      }
    }
  }

  return true;
};
