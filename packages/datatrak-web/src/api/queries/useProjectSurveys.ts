import { Entity, Project } from '@tupaia/types';
import { useSurveysQuery } from './useSurveysQuery';

/**
 * @deprecated Use {@link useSurveysQuery} instead.
 */
export const useProjectSurveys = (
  projectId?: Project['id'],
  {
    countryCode,
    searchTerm,
  }: {
    countryCode?: Entity['code'];
    searchTerm?: string;
  } = {},
) =>
  useSurveysQuery(
    {
      countryCode,
      includeCountryNames: false,
      projectId,
      searchTerm,
    },
    { enabled: projectId !== undefined },
  );
