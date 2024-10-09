/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { Project, ProjectCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';

export const useCountryAccessList = (projectCode?: Project['code']) => {
  return useQuery(
    ['me/countries', projectCode],
    (): Promise<ProjectCountryAccessListRequest.ResBody> =>
      get('me/countries', { params: { projectCode } }),
    {
      enabled: !!projectCode,
      initialData: [],
      placeholderData: [],
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up to date
    },
  );
};
