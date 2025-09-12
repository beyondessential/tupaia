import { Country, Survey } from '@tupaia/types';
import { DatatrakWebModelRegistry } from '../../types';

export const getSurveyUsers = async ({
  models,
  surveyCode,
  countryCode,
  searchTerm,
}: {
  models: DatatrakWebModelRegistry;
  surveyCode?: Survey['code'];
  countryCode?: Country['code'];
  searchTerm?: string;
}) => {
  if (!surveyCode || !countryCode) {
    return [];
  }

  const survey = await models.survey.findOne({ code: surveyCode });

  if (!survey) {
    throw new Error(`Survey with code ${surveyCode} not found`);
  }

  const { permission_group_id: permissionGroupId } = survey;

  if (!permissionGroupId) {
    return [];
  }

  // get the permission group
  const permissionGroup = await models.permissionGroup.findById(permissionGroupId);

  if (!permissionGroup) {
    throw new Error(`Permission group with id ${permissionGroupId} not found`);
  }

  return await models.user.getFilteredUsersForPermissionGroup(
    countryCode,
    permissionGroup,
    searchTerm,
  );
};
