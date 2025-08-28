import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest } from '@tupaia/types';
import { get } from '../api';

type ProjectedSurveysResponse = Required<
  Pick<
    DatatrakWebSurveyRequest.ResBody,
    'name' | 'code' | 'id' | 'surveyGroupName' | 'countryNames'
  >
>[];

export const useSurveys = () => {
  return useQuery<ProjectedSurveysResponse>(
    ['surveys'],
    async () =>
      await get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name', 'countryNames'],
        },
      }),
  );
};
