import { QUERY_CONJUNCTIONS, SqlQuery } from '@tupaia/database';
import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';
import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

const DEFAULT_SURVEY_ERROR_MESSAGE = 'Requires access to one of the countries the survey is in';

export const assertSurveyGetPermissions = async (accessPolicy, models, surveyId) => {
  const survey = ensure(
    await models.survey.findById(surveyId),
    `No survey exists with ID ${surveyId}`,
  );
  const [permissionGroup, countryCodes] = await Promise.all([
    survey.getPermissionGroup(),
    survey.getCountryCodes(),
  ]);

  if (accessPolicy.allowsSome(countryCodes, permissionGroup.name)) {
    return true;
  }

  throw new PermissionsError(DEFAULT_SURVEY_ERROR_MESSAGE);
};

// Used for edit and delete actions
export const assertSurveyEditPermissions = async (
  accessPolicy,
  models,
  surveyId,
  errorMessage = DEFAULT_SURVEY_ERROR_MESSAGE,
) => {
  const survey = ensure(
    await models.survey.findById(surveyId),
    `No survey exists with ID ${surveyId}`,
  );
  const [permissionGroup, countryCodes] = await Promise.all([
    survey.getPermissionGroup(),
    survey.getCountryCodes(),
  ]);

  if (
    accessPolicy.allowsAll(countryCodes, permissionGroup.name) &&
    accessPolicy.allowsAll(countryCodes, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)
  ) {
    return true;
  }

  throw new PermissionsError(errorMessage);
};

export const createSurveyViaCountryDBFilter = async (accessPolicy, models, criteria, countryId) => {
  const dbConditions = { ...criteria };

  const countryIdsByPermissionGroupId =
    await models.permissionGroup.fetchCountryIdsByPermissionGroupId(accessPolicy);

  // Even if we're BES admin, we need to filter by the country
  if (hasBESAdminAccess(accessPolicy)) {
    dbConditions[RAW] = {
      sql: '(ARRAY[?] <@ survey.country_ids)',
      parameters: countryId,
    };
  } else {
    const permissionGroupsForCountry = Object.keys(countryIdsByPermissionGroupId).filter(
      permissionGroupId => countryIdsByPermissionGroupId[permissionGroupId].includes(countryId),
    );

    dbConditions[RAW] =
      permissionGroupsForCountry.length === 0
        ? // Return no results because we don’t have access to any permission groups for this country
          { sql: 'FALSE' }
        : {
            sql: `(
              ARRAY[?] <@ survey.country_ids
              AND survey.permission_group_id IN ${SqlQuery.record(permissionGroupsForCountry)}
            )`,
            parameters: [countryId, ...permissionGroupsForCountry],
          };
  }
  return dbConditions;
};
