/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionGroup } from '@tupaia/types';
import { TupaiaWebServerModelRegistry } from '../types';

type FrontEndExcludedException = {
  permissionGroups: PermissionGroup['name'][];
};

const getShouldExcludeTypes = async (
  models: TupaiaWebServerModelRegistry,
  exceptions?: FrontEndExcludedException,
  accessPolicy?: AccessPolicy,
) => {
  // If there are no exceptions, then exclude the types
  if (!exceptions) return true;
  const allCountries = await models.country.find({});

  const allCountryCodes = allCountries.map(country => country.code);

  // If there are no permission groups in the exceptions, then exclude the types
  if (!exceptions?.permissionGroups) {
    return true;
  }

  const permissionGroups = exceptions?.permissionGroups || [];
  const userPermissionGroups = accessPolicy
    ? accessPolicy?.getPermissionGroups(allCountryCodes)
    : [];

  const userHasAccessToExcludedTypes = permissionGroups.some(permissionGroup =>
    userPermissionGroups.includes(permissionGroup),
  );

  // If the user has any of the permission groups in the exceptions, then do not exclude the types
  return !userHasAccessToExcludedTypes;
};

export const getTypesToExclude = async (
  models: TupaiaWebServerModelRegistry,
  accessPolicy: AccessPolicy | undefined,
  projectCode: string,
  useDefaultIfNoExclusions = true,
) => {
  const project = await models.project.findOne({
    code: projectCode,
  });

  if (!project) throw new Error(`Project with code '${projectCode}' not found`);

  const { config } = project;
  const { typesExcludedFromWebFrontend } = models.entity;

  if (config?.frontendExcluded) {
    const typesFilter = [];
    for (const excludedConfig of config?.frontendExcluded) {
      const { types, exceptions } = excludedConfig;
      const shouldExcludeTypes = await getShouldExcludeTypes(models, exceptions, accessPolicy);

      if (shouldExcludeTypes) {
        typesFilter.push(...types);
      } else {
        if (useDefaultIfNoExclusions) {
          typesFilter.push(...typesExcludedFromWebFrontend);
        }
      }
    }
    return typesFilter;
  }
  return useDefaultIfNoExclusions ? typesExcludedFromWebFrontend : [];
};

// In the db project.config.frontendExcluded is an array with one entry for some reason
export async function generateFrontendExcludedFilter(
  models: TupaiaWebServerModelRegistry,
  accessPolicy: AccessPolicy | undefined,
  projectCode: string,
) {
  const typesToExclude = await getTypesToExclude(models, accessPolicy, projectCode);

  if (typesToExclude.length === 0) {
    return {};
  }

  return {
    type: {
      comparator: '!=',
      comparisonValue: typesToExclude,
    },
  };
}
