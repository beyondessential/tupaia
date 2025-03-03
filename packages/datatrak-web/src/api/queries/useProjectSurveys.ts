import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { Entity } from '../../types';

export const useProjectSurveys = (
  projectId?: Project['id'],
  selectedCountryCode?: Entity['code'],
) => {
  return useQuery(
    ['surveys', projectId, selectedCountryCode],
    (): Promise<DatatrakWebSurveyRequest.ResBody[]> =>
      get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name'],
          projectId,
          countryCode: selectedCountryCode,
        },
      }),
    {
      enabled: !!projectId && !!selectedCountryCode,
    },
  );
};
