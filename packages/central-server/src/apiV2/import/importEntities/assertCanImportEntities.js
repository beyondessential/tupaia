import { getCountryCode } from '@tupaia/utils';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';

export const assertCanImportEntities = async (accessPolicy, countryNames) => {
  const countryCodes = countryNames.map(countryName => getCountryCode(countryName));

  for (let i = 0; i < countryCodes.length; i++) {
    const countryCode = countryCodes[i];

    // If user doesn't have TUPAIA_ADMIN_PANEL_PERMISSION_GROUP access
    // to ANY of the countries of the entities being imported, it should fail!
    if (!accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      const countryName = countryNames[i];
      throw new Error(
        `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to country ${countryName}`,
      );
    }
  }

  return true;
};
