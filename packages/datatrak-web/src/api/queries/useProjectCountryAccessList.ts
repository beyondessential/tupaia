/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { Project, WebServerProjectCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';

export const useProjectCountryAccessList = (projectCode: Project['code']) => {
  return useQuery(
    ['countryAccessList', projectCode],
    (): Promise<WebServerProjectCountryAccessListRequest.ResBody> =>
      get(`countryAccessList/${projectCode}`),
    {
      enabled: !!projectCode,
      initialData: [],
      placeholderData: [],
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up-to-date
    },
  );
};
