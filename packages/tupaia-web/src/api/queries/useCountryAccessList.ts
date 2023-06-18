/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { UseQueryResult, useQuery } from 'react-query';
// import { get } from '../api';
import { CountryAccessListItem } from '../../types';

const testData = [
  {
    id: '5e38df0b61f76a6bcf212518',
    name: 'American Samoa',
    hasAccess: false,
    accessRequests: ['none'],
  },
  {
    id: '5e82eed461f76a274300022d',
    name: 'Australia',
    hasAccess: false,
    accessRequests: ['none', 'none'],
  },
  {
    id: '5eba39e161f76a3da3000061',
    name: 'Cambodia',
    hasAccess: false,
    accessRequests: ['none'],
  },
  {
    id: '5d3f884462165f31bf416c1e',
    name: 'Cook Islands',
    hasAccess: false,
    accessRequests: ['none'],
  },
  {
    id: '5d3f88443cd45d31bf1632a3',
    name: "Côte d'Ivoire",
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5d3f884472db4d31bfe44aa1',
    name: 'Demo Land',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5df806f761f76a485ce3622d',
    name: 'Federated States of Micronesia',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5d51f501f013d6320f3cf633',
    name: 'Fiji',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '634de9ca2a1ed82f1d00009e',
    name: 'FPBS Warehouse',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf21257d',
    name: 'French Polynesia',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf21254d',
    name: 'Guam',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5d3f884414261831bfd9e7c6',
    name: 'Kiribati',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5d3f884448c79c31bf5c4d50',
    name: 'Laos',
    hasAccess: true,
    accessRequests: ['laos_eoc', 'laos_schools'],
  },
  {
    id: '5df1b88161f76a485c175339',
    name: 'Marshall Islands',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5e1ff87d61f76a06d134ea47',
    name: 'Nauru',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf2125ae',
    name: 'New Caledonia',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5fbb269361f76a2292012ebb',
    name: 'New Zealand',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '63625b422a1ed82f1d15e87a',
    name: 'Nigeria',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf21224b',
    name: 'Niue',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf2125db',
    name: 'Northern Mariana Islands',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf2123c3',
    name: 'Palau',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5d3f8844f327a531bfd8ad77',
    name: 'Papua New Guinea',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5d3f8844f3389931bf24aa57',
    name: 'Philippines',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf212605',
    name: 'Pitcairn Islands',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5df1b88c61f76a485cd1ca09',
    name: 'Samoa',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5d3f8844a078f431bf0bc177',
    name: 'Solomon Islands',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5eba39e161f76a3da3000060',
    name: 'Timor-Leste',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5d3f88447219a431bfe702c9',
    name: 'Tokelau',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5d3f884471bb2e31bfacae23',
    name: 'Tonga',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf2124c1',
    name: 'Tuvalu',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '634de9c92a1ed82f1d00009b',
    name: 'UNFPA Warehouse',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5d3f88442c423131bf2436a7',
    name: 'Vanuatu',
    hasAccess: true,
    accessRequests: [],
  },
  {
    id: '5d3f884488839d31bf39eb61',
    name: 'Venezuela',
    hasAccess: false,
    accessRequests: [],
  },
  {
    id: '5e38df0b61f76a6bcf212630',
    name: 'Wallis and Futuna',
    hasAccess: false,
    accessRequests: [],
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
