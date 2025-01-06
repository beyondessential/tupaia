/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest } from '@tupaia/types';
import { get } from '../api';

export const useSurveys = () => {
  return useQuery(
    ['surveys'],
    (): Promise<DatatrakWebSurveyRequest.ResBody[]> =>
      get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name', 'countryNames'],
        },
      }),
  );
};
