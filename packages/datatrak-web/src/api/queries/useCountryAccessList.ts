/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { DatatrakWebCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';

export const useCountryAccessList = () => {
  return useQuery(
    'countryAccessList',
    (): Promise<DatatrakWebCountryAccessListRequest.ResBody> => get('me/countries'),
    {
      placeholderData: [],
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up to date
    },
  );
};
