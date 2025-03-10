import { TupaiaApiClient } from '@tupaia/api-client';

export const mapProjectEntitiesToCountries = async (
  apiClient: TupaiaApiClient,
  hierarchy: string,
  entityCodes: string[],
) => {
  // Currently in database, there is a 1:1 relationship between hierarchy and project, so we assume that the project code is the hierarchy name.

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
