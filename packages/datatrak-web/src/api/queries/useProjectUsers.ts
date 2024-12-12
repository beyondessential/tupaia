/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { Project, DatatrakWebUsersRequest } from '@tupaia/types';
import { get } from '../api';

export const useProjectUsers = (projectCode?: Project['code'], searchTerm?: string) => {
  return useQuery(
    ['surveyUsers', projectCode, searchTerm],
    (): Promise<DatatrakWebUsersRequest.ResBody> =>
      get(`users/${projectCode}`, {
        params: {
          searchTerm,
        },
      }),
    {
      enabled: !!projectCode,
    },
  );
};
