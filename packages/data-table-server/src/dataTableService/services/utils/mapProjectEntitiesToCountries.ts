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
  const projects = (await apiClient.entity.getEntities(hierarchy, entityCodes, {
    fields: ['code'],
    filter: { type: 'project' },
  })) as { code: string }[];
  const projectCodes = projects.map(({ code }) => code);

  const countriesInProjects = (await apiClient.entity.getDescendantsOfEntities(
    hierarchy,
    projectCodes,
    {
      fields: ['code'],
      filter: { type: 'country' },
    },
  )) as { code: string }[];

  return Array.from(
    new Set([
      ...entityCodes.filter(code => !projectCodes.includes(code)),
      ...countriesInProjects.map(({ code }) => code),
    ]),
  );
};
