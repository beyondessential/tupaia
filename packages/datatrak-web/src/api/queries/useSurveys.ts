/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { DatatrakWebSurveysRequest } from '@tupaia/types';

export const useSurveys = () => {
  return useQuery(
    'surveys',
    (): Promise<DatatrakWebSurveysRequest.ResBody> =>
      get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name'],
        },
      }),
  );
};
