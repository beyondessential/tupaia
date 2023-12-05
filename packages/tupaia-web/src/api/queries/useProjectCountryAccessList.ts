/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { TupaiaWebProjectCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';
import { ProjectCode } from '../../types';

export const useProjectCountryAccessList = (projectCode: ProjectCode) => {
  return useQuery(
    ['countryAccessList', projectCode],
    (): Promise<TupaiaWebProjectCountryAccessListRequest.ResBody> =>
      get(`countryAccessList/${projectCode}`),
    {
      placeholderData: [],
      enabled: !!projectCode,
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up to date
    },
  );
};
