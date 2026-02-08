import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';

// Used for edit and delete actions
export const assertSurveyEditPermissions = async (
  accessPolicy,
  models,
  surveyId,
  errorMessage = 'Requires access to one of the countries the survey is in',
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
