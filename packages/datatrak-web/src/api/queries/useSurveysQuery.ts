import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest } from '@tupaia/types';
import { get } from '../api';

export const useSurveysQuery = () => {
  return useQuery<DatatrakWebSurveyRequest.ResBody[]>(['surveys'], () =>
    get('surveys', {
      params: {
        fields: ['name', 'code', 'id', 'survey_group.name', 'countryNames'],
      },
    }),
  );
};
