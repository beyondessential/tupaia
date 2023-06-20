/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UseQueryResult, useQuery } from 'react-query';
// import { get } from '../api';
import { CountryAccessListItem } from '../../types';

const testData = [
  {
    id: 'AUSTRALIA',
    name: 'Australia',
    hasAccess: false,
    accessRequests: ['none', 'none'],
  },
  {
    id: 'CAMBODIA',
    name: 'Cambodia',
    hasAccess: false,
    accessRequests: ['none'],
  },
  {
    id: 'COOKISLANDS',
    name: 'Cook Islands',
    hasAccess: false,
    accessRequests: ['none'],
  },
  {
    id: 'DEMOLAND',
    name: 'Demo Land',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: 'FIJI',
    name: 'Fiji',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: 'FRENCHPOLYNESIA',
    name: 'French Polynesia',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: 'LAOS',
    name: 'Laos',
    hasAccess: true,
    accessRequests: ['laos_eoc', 'laos_schools'],
  },
];

export const useCountryAccessList = () => {
  return useQuery(
    'countryAccessList',
    () => {
      // get('countryAccessList')
      return Promise.resolve(testData); // TODO: remove this once the endpoints are working
    },
    {
      placeholderData: [],
    },
  ) as Omit<UseQueryResult, 'data'> & {
    data: CountryAccessListItem[];
  };
};
