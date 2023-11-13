/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebSurveyRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { Entity } from '../../types';

export const useSurveys = (selectedCountryName?: Entity['name'], projectId?: Project['id']) => {
  return useQuery(
    ['surveys', projectId],
    (): Promise<DatatrakWebSurveyRequest.ResBody[]> =>
      get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name'],
          projectId,
        },
      }),
    {
      select: data => {
        return data.filter(survey => survey.countryNames?.includes(selectedCountryName!));
      },
      enabled: !!projectId,
    },
  );
};
