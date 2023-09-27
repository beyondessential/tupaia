/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebSurveysRequest } from '@tupaia/types';
import { get } from '../api';
import { Entity } from '../../types';

export const useSurveys = (selectedCountryName?: Entity['name']) => {
  return useQuery(
    'surveys',
    (): Promise<DatatrakWebSurveysRequest.ResBody> =>
      get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name'],
        },
      }),
    {
      select: data => {
        return data.filter(survey => survey.countryNames?.includes(selectedCountryName!));
      },
    },
  );
};
