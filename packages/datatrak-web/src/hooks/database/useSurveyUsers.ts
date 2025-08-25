import { ResultObject, useDatabaseEffect } from './useDatabaseEffect';
import { Survey } from '../../types';
import { getFilteredUsersForPermissionGroup } from '../../utils/getFilteredUsers';
import { Country } from '@tupaia/types';

export type SurveyUser = {
  id: string;
  name: string;
};

export const useSurveyUsers = (
  surveyCode?: Survey['code'],
  countryCode?: Country['code'],
  searchTerm?: string,
): ResultObject<SurveyUser[]> =>
  useDatabaseEffect(
    async models => {
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

      return await models.user.getFilteredUsersForPermissionGroup(countryCode, permissionGroup, searchTerm);
    },
    [surveyCode, countryCode, searchTerm],
    { enabled: Boolean(surveyCode) && Boolean(countryCode) },
  );
