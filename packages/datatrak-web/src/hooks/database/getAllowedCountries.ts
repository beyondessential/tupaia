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
  let allowedCountries = countryEntities
    .map(child => child.country_code)
    .filter(isNotNullish)
    .filter((countryCode, index, countryCodes) => countryCodes.indexOf(countryCode) === index); // De-duplicate countryCodes

  if (!isPublic) {
    const { permission_groups: projectPermissionGroups } = await models.project.findOne({
      code: project.code,
    });

    // Fetch all country codes we have any of the project permission groups access to
    const projectAccessibleCountries: string[] = [];

    for (const permission of projectPermissionGroups) {
      projectAccessibleCountries.push(...(accessPolicy?.getEntitiesAllowed(permission) || []));
    }
    allowedCountries = allowedCountries.filter(countryCode =>
      projectAccessibleCountries.includes(countryCode),
    );
  }

  return allowedCountries;
};
