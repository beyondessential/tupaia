import { uniq } from 'es-toolkit';

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
    for (const excludedConfig of config.frontendExcluded) {
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

const parseComparisonValue = (comparisonValue: string | string[]): string[] => {
  if (Array.isArray(comparisonValue)) {
    return comparisonValue;
  }
  if (comparisonValue.includes(',')) {
    return comparisonValue.split(',');
  }
  return [comparisonValue];
};

const parseExistingTypesFilter = (existingTypesFilter: Record<string, any> | string) => {
  if (typeof existingTypesFilter === 'string') {
    return {
      comparisonValue: existingTypesFilter,
      comparator: '==',
    };
  }
  return existingTypesFilter;
};

const mergeExistingTypesFilter = (
  existingTypesFilter: Record<string, any> | string,
  typesToExclude: string[],
) => {
  const parsedExistingTypesFilter = parseExistingTypesFilter(existingTypesFilter);
  const typeComparisonValue = parseComparisonValue(parsedExistingTypesFilter.comparisonValue);

  // if the existing filter is an '!=' filter, we need to add the types to exclude to the comparison value
  if (parsedExistingTypesFilter.comparator === '!=') {
    return {
      type: {
        comparator: '!=',
        comparisonValue: uniq([...typeComparisonValue, ...typesToExclude]),
      },
    };
  }

  // exclude the types from the existing filter
  const typesToInclude = typeComparisonValue.filter(type => !typesToExclude.includes(type));

  // If there are no types to include, return a filter to exclude the excluded types instead
  if (typesToInclude.length === 0) {
    return {
      type: {
        comparator: '!=',
        comparisonValue: typesToExclude,
      },
    };
  }

  // If there are types to include, return a filter to include the included types with the excluded types
  return {
    type: typesToInclude.join(','),
  };
};

// In the db project.config.frontendExcluded is an array with one entry for some reason
export async function generateFrontendExcludedFilter(
  models: TupaiaWebServerModelRegistry,
  accessPolicy: AccessPolicy,
  projectCode: string,
  existingTypesFilter?: Record<string, any> | string,
) {
  const typesToExclude = await getTypesToExclude(models, accessPolicy, projectCode);

  // If there are no types to exclude, return the existing types filter
  if (typesToExclude.length === 0) {
    return existingTypesFilter
      ? {
          type: existingTypesFilter,
        }
      : {};
  }

  // If there is no existing types filter, return a filter to exclude the types
  if (!existingTypesFilter) {
    return {
      type: {
        comparator: '!=',
        comparisonValue: typesToExclude,
      },
    };
  }

  // if there is an existing type filter, we need to exclude the types from it
  return mergeExistingTypesFilter(existingTypesFilter, typesToExclude);
}
