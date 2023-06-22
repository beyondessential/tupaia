/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

const response = [
  {
    name: 'Australia',
    entityCode: 'AU',
    parentEntityCode: null,
    type: 'Country',
  },
  {
    name: 'Cook Islands',
    entityCode: 'CI',
    parentEntityCode: null,
    type: 'Country',
  },
  {
    name: 'Fiji',
    entityCode: 'FJ',
    parentEntityCode: null,
    type: 'Country',
  },
  {
    name: 'Tonga',
    entityCode: 'TO',
    parentEntityCode: 'TO',
    type: 'Country',
  },
];

export const useEntities = (projectCode: string, entityCode?: string) => {
  return useQuery(['entities', projectCode, entityCode], async () =>
    get(`entities/${projectCode}/explore`),
  );
};
