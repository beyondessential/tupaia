/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest, Project } from '@tupaia/types';
import { get } from '../api';
import { Entity } from '../../types';

interface QueryOptions {
  countryCode?: Entity['code'];
  searchTerm?: string;
}

export const useProjectSurveys = (
  projectId?: Project['id'],
  { countryCode, searchTerm }: QueryOptions = {},
) => {
  return useQuery(
    ['surveys', projectId, countryCode, searchTerm],
    (): Promise<DatatrakWebSurveyRequest.ResBody[]> => {
      return get('surveys', {
        params: {
          fields: ['name', 'code', 'id', 'survey_group.name'],
          projectId,
          ...(searchTerm && { searchTerm }),
          ...(countryCode && { countryCode }),
        },
      });
    },
    {
      enabled: !!projectId,
    },
  );
};
