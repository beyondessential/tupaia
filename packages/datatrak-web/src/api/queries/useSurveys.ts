import { DatatrakWebSurveyRequest } from '@tupaia/types';
import { useOnlineQuery } from './useOnlineQuery';
import { get } from '../api';

type ProjectedSurveysResponse = Required<
  Pick<
    DatatrakWebSurveyRequest.ResBody,
    'name' | 'code' | 'id' | 'surveyGroupName' | 'countryNames'
  >
>[];

export const useSurveys = () => {
  return useOnlineQuery<ProjectedSurveysResponse>(
    ['surveys'],
    async () =>
      await get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name', 'countryNames'],
        },
      }),
  );
};
