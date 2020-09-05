import { BES_ADMIN_PERMISSION_GROUP } from '../../permissions';

export const canExportSurveyResponses = async (accessPolicy, countryCode, permissionGroup) => {
  if (accessPolicy.allows(null, BES_ADMIN_PERMISSION_GROUP)) {
    return true;
  }

  return accessPolicy.allows(countryCode, permissionGroup);
};
