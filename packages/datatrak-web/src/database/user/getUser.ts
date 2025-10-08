import { CountryRecord, ProjectRecord } from '@tupaia/tsmodels';

import { GetUserLocalContext } from '../../api/queries/useUser';

export const getUser = async ({ models }: GetUserLocalContext) => {
  const currentUserEmail = await localStorage.getItem('currentUserEmail');
  if (!currentUserEmail) {
    return {};
  }

  const {
    id,
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    email,
    employer,
    position,
    mobile_number: mobileNumber,
    preferences = {},
    // @ts-ignore - access_policy is not in the UserRecord type and only used for client
    access_policy: accessPolicy,
  } = (await models.user.findOne({
    email: currentUserEmail,
  })) || {};
  const {
    project_id: projectId,
    country_id: countryId,
    delete_account_requested,
    hide_welcome_screen,
  } = preferences;

  let project: ProjectRecord | null = null;
  let country: CountryRecord | null = null;
  if (projectId) {
    project = await models.project.findById(projectId);
  }
  if (countryId) {
    const countryResponse = await models.country.findById(countryId);
    country = countryResponse || null;
  }

  return {
    fullName,
    firstName,
    lastName,
    email,
    id,
    employer,
    position,
    mobileNumber,
    projectId,
    project,
    country,
    deleteAccountRequested: delete_account_requested === true,
    hideWelcomeScreen: hide_welcome_screen === true,
    accessPolicy,
  };
};
