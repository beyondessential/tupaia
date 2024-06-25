/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebSurveyUsersRequest } from '@tupaia/types';
import { get } from '../api';
import { Survey } from '../../types';

export const useSurveyUsers = (surveyCode?: Survey['code'], searchTerm?: string) => {
  return useQuery(
    ['surveyUsers', surveyCode, searchTerm],
    (): Promise<DatatrakWebSurveyUsersRequest.ResBody[]> =>
      get(`users/${surveyCode}`, {
        params: {
          filter: searchTerm
            ? {
                full_name: {
                  comparator: 'ilike',
                  comparisonValue: `${searchTerm}%`,
                },
              }
            : undefined,
        },
      }),
    {
      enabled: !!surveyCode,
    },
  );
};
