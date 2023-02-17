/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';

export const mapProjectEntitiesToCountries = async (
  apiClient: TupaiaApiClient,
  hierarchy: string,
  entityCodes: string[],
) => {
  // Assumes that there is only one project per hierarchy

  const projectCode = hierarchy;

  if (!entityCodes.includes(projectCode)) {
    return entityCodes;
  }
  const countriesInProject = (await apiClient.entity.getDescendantsOfEntity(
    hierarchy,
    projectCode,
    {
      fields: ['code'],
      filter: { type: 'country' },
    },
  )) as { code: string }[];

  return Array.from(
    new Set([
      ...entityCodes.filter(code => code !== projectCode),
      ...countriesInProject.map(({ code }) => code),
    ]),
  );
};
