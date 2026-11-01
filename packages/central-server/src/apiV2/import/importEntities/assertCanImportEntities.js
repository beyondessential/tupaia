import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';

/**
 * Check that the user has Tupaia Admin Panel access to every country in the
 * upload. Country codes are taken directly from each row's `country_code` —
 * the importer no longer derives them from sheet names.
 */
export const assertCanImportEntities = async (accessPolicy, countryCodes) => {
  for (const countryCode of countryCodes) {
    if (!accessPolicy.allows(countryCode, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP)) {
      throw new Error(
        `Need ${TUPAIA_ADMIN_PANEL_PERMISSION_GROUP} access to country ${countryCode}`,
      );
    }
  }
  return true;
};
