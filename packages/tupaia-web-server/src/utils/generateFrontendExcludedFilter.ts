/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaWebServerModelRegistry } from '../types';

export const getTypesToExclude = async (
  models: TupaiaWebServerModelRegistry,
  accessPolicy: AccessPolicy,
  projectCode: string,
) => {
  const project = await models.project.findOne({
    code: projectCode,
  });

  if (!project) throw new Error(`Project with code '${projectCode}' not found`);

  const { config } = project;

  if (config?.frontendExcluded) {
    const typesFilter = [];
    for (const excludedConfig of config?.frontendExcluded) {
      const { types, exceptions } = excludedConfig;

      const exceptedPermissionGroups = exceptions?.permissionGroups ?? [];
      const shouldExcludeTypes = !exceptedPermissionGroups.some(permissionGroup =>
        accessPolicy.allowsAnywhere(permissionGroup),
      );

      if (shouldExcludeTypes) {
        typesFilter.push(...types);
      }
    }
    return typesFilter;
  }
  return [];
};

// In the db project.config.frontendExcluded is an array with one entry for some reason
export async function generateFrontendExcludedFilter(
  models: TupaiaWebServerModelRegistry,
  accessPolicy: AccessPolicy,
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
