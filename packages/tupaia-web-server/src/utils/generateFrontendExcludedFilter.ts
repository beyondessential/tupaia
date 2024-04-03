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

const getUserHasAccessToExcludedTypes = async (
  models: TupaiaWebServerModelRegistry,
  exceptions?: FrontEndExcludedException,
  accessPolicy?: AccessPolicy,
) => {
  if (!exceptions) return true;
  const allCountries = await models.country.find({});

  const allCountryCodes = allCountries.map(country => country.code);

  if (!exceptions?.permissionGroups) {
    throw new Error(
      `'frontendExcluded.exceptions' config should have 'permissionGroups' specified`,
    );
  }
  const permissionGroups = exceptions?.permissionGroups || [];
  const userPermissionGroups = accessPolicy
    ? accessPolicy?.getPermissionGroups(allCountryCodes)
    : [];
  const userHasAccessToExcludedTypes = permissionGroups.some(permissionGroup =>
    userPermissionGroups.includes(permissionGroup),
  );

  return userHasAccessToExcludedTypes;
};

export const getTypesToExclude = async (
  models: TupaiaWebServerModelRegistry,
  accessPolicy: AccessPolicy | undefined,
  projectCode: string,
  useDefaultIfNoExclusions = true,
) => {
  const project = await models.project.find({
    code: projectCode,
  });
  const { config } = project[0];
  const { typesExcludedFromWebFrontend } = models.entity;

  if (config?.frontendExcluded) {
    const typesFilter = [];
    for (const excludedConfig of config?.frontendExcluded) {
      const { types, exceptions } = excludedConfig;
      const userHasAccessToExcludedTypes = await getUserHasAccessToExcludedTypes(
        models,
        exceptions,
        accessPolicy,
      );

      if (!userHasAccessToExcludedTypes) {
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
