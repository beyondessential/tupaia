import { GETHandler } from './GETHandler';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../permissions';
import { mergeFilter } from './utilities';

export const assertCountryPermissions = async (accessPolicy, models, countryId) => {
  const country = await models.country.findById(countryId);
  if (!country) {
    throw new Error(`No country exists with id ${countryId}`);
  }
  if (!accessPolicy.allows(country.code)) {
    throw new Error('You do not have permissions for this country');
  }
  return true;
};

export class GETCountries extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(countryId, options) {
    const countryPermissionChecker = accessPolicy =>
      assertCountryPermissions(accessPolicy, this.models, countryId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, countryPermissionChecker]),
    );

    return super.findSingleRecord(countryId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = { ...criteria };

    if (!hasBESAdminAccess(this.accessPolicy)) {
      dbConditions['country.code'] = mergeFilter(
        this.accessPolicy.getEntitiesAllowed(),
        dbConditions['country.code'],
      );
    }

    return { dbConditions, dbOptions: options };
  }
}
