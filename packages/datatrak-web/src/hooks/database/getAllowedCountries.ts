import { ProjectRecord, EntityRecord, extractEntityFilterFromObject } from '@tupaia/tsmodels';
import { isNotNullish } from '@tupaia/tsutils';

import { DatatrakWebModelRegistry } from '../../types';
import { AccessPolicy } from '@tupaia/access-policy';

export const getAllowedCountries = async (
  models: DatatrakWebModelRegistry,
  project: ProjectRecord,
  isPublic: boolean,
  accessPolicy?: AccessPolicy,
  countryEntities: EntityRecord[] = [],
) => {
  let allowedCountries = [
    ...new Set(countryEntities.map(child => child.country_code).filter(isNotNullish)),
  ]; // De-duplicate countryCodes

  if (!isPublic) {
    const { permission_groups: projectPermissionGroups } = await models.project.findOne({
      code: project.code,
    });

    // Fetch all country codes we have any of the project permission groups access to
    const projectAccessibleCountries = projectPermissionGroups.flatMap(
      (permission: string) => accessPolicy?.getEntitiesAllowed(permission) || [],
    );
    allowedCountries = allowedCountries.filter(countryCode =>
      projectAccessibleCountries.includes(countryCode),
    );
  }

  return allowedCountries;
};
