import { GETHandler } from './GETHandler';
import { assertAnyPermissions, assertBESAdminAccess, hasBESAdminAccess } from '../permissions';
import { mergeFilter } from './utilities';

export const assertClinicPermissions = async (accessPolicy, models, clinicId) => {
  const clinic = await models.clinic.findById(clinicId);
  if (!clinic) {
    throw new Error(`No clinic exists with id ${clinicId}`);
  }
  const country = await models.country.findById(clinic.country_id);
  if (!accessPolicy.allows(country.code)) {
    throw new Error('You do not have permissions for this clinic');
  }
  return true;
};

export class GETClinics extends GETHandler {
  permissionsFilteredInternally = true;

  async findSingleRecord(clinicId, options) {
    const clinicPermissionChecker = accessPolicy =>
      assertClinicPermissions(accessPolicy, this.models, clinicId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, clinicPermissionChecker]),
    );

    return super.findSingleRecord(clinicId, options);
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = { ...criteria };
    const countryCodes = this.accessPolicy.getEntitiesAllowed();
    const countries = await this.models.country.find({ code: countryCodes });

    if (!hasBESAdminAccess(this.accessPolicy)) {
      dbConditions['clinic.country_id'] = mergeFilter(
        countries.map(c => c.id),
        dbConditions['clinic.country_id'],
      );
    }

    return { dbConditions, dbOptions: options };
  }
}
