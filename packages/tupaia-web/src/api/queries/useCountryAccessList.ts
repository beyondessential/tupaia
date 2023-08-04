/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UseQueryResult, useQuery } from 'react-query';
import { TupaiaWebCountryAccessListRequest } from '@tupaia/types';
import { get } from '../api';
import { CountryAccessListItem } from '../../types';

export const useCountryAccessList = () => {
  return useQuery(
    'countryAccessList',
    (): Promise<TupaiaWebCountryAccessListRequest.ResBody> => get('countryAccessList'),
    {
      placeholderData: [],
      staleTime: 0, // Disable cache so that if we go back to the request access view, the country list is up to date
    },
  ) as Omit<UseQueryResult, 'data'> & {
    data: CountryAccessListItem[];
  };
};
