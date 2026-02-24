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

  const survey = await models.survey.findOneOrThrow({ code: surveyCode });

  const { permission_group_id: permissionGroupId } = survey;

  if (!permissionGroupId) {
    return [];
  }

  // get the permission group
  const permissionGroup = await models.permissionGroup.findByIdOrThrow(permissionGroupId);

  return await models.user.getFilteredUsersForPermissionGroup(
    countryCode,
    permissionGroup,
    searchTerm,
  );
};
