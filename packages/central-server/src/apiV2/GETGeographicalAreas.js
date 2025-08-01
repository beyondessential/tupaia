import { NotFoundError, PermissionsError } from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../permissions';
import { GETHandler } from './GETHandler';
import { mergeFilter } from './utilities';

export const assertGeographicalAreaPermissions = async (
  accessPolicy,
  models,
  geographicalAreaId,
) => {
  const geographicalArea = await models.geographicalArea.findById(geographicalAreaId);
  if (!geographicalArea) {
    throw new NotFoundError(`No geographical area exists with ID ${geographicalAreaId}`);
  }

  const country = await models.country.findById(geographicalArea.country_id);
  if (!country) {
    throw new NotFoundError(`No country exists with ID ${geographicalArea.country_id}`);
  }

  if (!accessPolicy.allows(country.code)) {
    throw new PermissionsError('You do not have permissions for this geographical area');
  }

  return true;
};

export class GETGeographicalAreas extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(geographicalAreaId, options) {
    const geographicalAreaPermissionChecker = accessPolicy =>
      assertGeographicalAreaPermissions(accessPolicy, this.models, geographicalAreaId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, geographicalAreaPermissionChecker]),
    );

    return super.findSingleRecord(geographicalAreaId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = { ...criteria };
    const countryCodes = this.accessPolicy.getEntitiesAllowed();
    const countries = await this.models.country.find({ code: countryCodes });

    if (!hasBESAdminAccess(this.accessPolicy)) {
      dbConditions['geographical_area.country_id'] = mergeFilter(
        countries.map(c => c.id),
        dbConditions['geographical_area.country_id'],
      );
    }

    return { dbConditions, dbOptions: options };
  }
}
