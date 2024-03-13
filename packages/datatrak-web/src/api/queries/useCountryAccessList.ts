/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { CentralServerProjectCountryAccessListRequest, Project } from '@tupaia/types';
import { get } from '../api';

export const useCountryAccessList = (projectCode: Project['code']) => {
  return useQuery(
    ['countries', projectCode],
    (): Promise<CentralServerProjectCountryAccessListRequest.ResBody> => get('me/countries'),
    {
      initialData: [],
      placeholderData: [],
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up to date
    },
  );
};
