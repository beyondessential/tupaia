import { useQuery } from '@tanstack/react-query';
import { Country, DatatrakWebUsersRequest } from '@tupaia/types';
import { get } from '../api';
import { Survey } from '../../types';

export const useSurveyUsers = (
  surveyCode?: Survey['code'],
  countryCode?: Country['code'],
  searchTerm?: string,
) => {
  return useQuery(
    ['surveyUsers', surveyCode, countryCode, searchTerm],
    (): Promise<DatatrakWebUsersRequest.ResBody> =>
      get(`users/${surveyCode}/${countryCode}`, {
        params: {
          searchTerm,
        },
      }),
    {
      enabled: !!surveyCode && !!countryCode,
    },
  );
};
