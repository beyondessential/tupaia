import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { Entity } from '../../types';

interface QueryOptions {
  countryCode?: Entity['code'];
  searchTerm?: string;
}

export const useProjectSurveys = (
  projectId?: Project['id'],
  { countryCode, searchTerm }: QueryOptions = {},
) => {
  const getSurveys = () =>
    get('surveys', {
      params: {
        fields: ['name', 'code', 'id', 'survey_group.name'],
        projectId,
        ...(searchTerm && { searchTerm }),
        ...(countryCode && { countryCode }),
      },
    });

  return useQuery<DatatrakWebSurveyRequest.ResBody[]>(
    ['surveys', projectId, countryCode, searchTerm],
    getSurveys,
    { enabled: !!projectId },
  );
};
