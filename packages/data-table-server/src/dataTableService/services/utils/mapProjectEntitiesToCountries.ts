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
  const entities = (await apiClient.entity.getEntities(hierarchy, entityCodes, {
    fields: ['code', 'type'],
  })) as { code: string; type: string }[];

  const projects = entities.filter(({ type }) => type === 'project');
  const countriesInProjects = (await apiClient.entity.getDescendantsOfEntities(
    hierarchy,
    projects.map(({ code }) => code),
    {
      fields: ['code'],
      filter: { type: 'country' },
    },
  )) as { code: string }[];

  return Array.from(new Set([...entityCodes, ...countriesInProjects.map(({ code }) => code)]));
};
