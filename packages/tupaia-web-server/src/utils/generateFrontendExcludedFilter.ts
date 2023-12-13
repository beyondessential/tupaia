/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

interface FrontEndExcludedConfig {
  types: string[];
}

// In the db project.config.frontendExcluded is an array with one entry for some reason
export function generateFrontendExcludedFilter(
  {
    frontendExcluded,
  }: {
    frontendExcluded: FrontEndExcludedConfig[] | undefined;
  },
  defaultFrontendExcludedFields: string[] = [],
) {
  return frontendExcluded
    ? {
        type: {
          comparator: '!=',
          comparisonValue: frontendExcluded[0].types,
        },
      }
    : {
        type: {
          comparator: '!=',
          comparisonValue: defaultFrontendExcludedFields,
        },
      };
}
