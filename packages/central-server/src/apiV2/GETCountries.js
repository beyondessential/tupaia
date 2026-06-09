import { ensure } from '@tupaia/tsutils';
import { PermissionsError } from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../permissions';
import { GETHandler } from './GETHandler';
import { mergeFilter } from './utilities';

export const assertCountryPermissions = async (accessPolicy, models, countryId) => {
  const country = ensure(
    await models.country.findById(countryId),
    `No country exists with ID ${countryId}`,
  );
  if (!accessPolicy.allows(country.code)) {
    throw new PermissionsError('You do not have permissions for this country');
  }
  return true;
};

export class GETCountries extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

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
