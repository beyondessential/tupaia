/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebSurveysRequest } from '@tupaia/types';
import { get } from '../api';
import { Entity } from '../../types';

export const useSurveys = (selectedCountryName?: Entity['name']) => {
  const { data: surveys, isLoading, isFetched } = useQuery(
    'surveys',
    (): Promise<DatatrakWebSurveysRequest.ResBody> =>
      get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name'],
        },
      }),
  );
  // Filter the surveys by the selected country name
  return {
    isLoading: isLoading || !isFetched,
    surveys: surveys?.filter((survey: any) => survey.countryNames?.includes(selectedCountryName)),
  };
};
