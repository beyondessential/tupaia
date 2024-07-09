/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { Country, DatatrakWebSurveyUsersRequest } from '@tupaia/types';
import { get } from '../api';
import { Survey } from '../../types';

export const useSurveyUsers = (
  surveyCode?: Survey['code'],
  countryCode?: Country['code'],
  searchTerm?: string,
) => {
  return useQuery(
    ['surveyUsers', surveyCode, countryCode, searchTerm],
    (): Promise<DatatrakWebSurveyUsersRequest.ResBody> =>
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
