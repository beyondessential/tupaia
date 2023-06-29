/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { EntityCode, ProjectCode } from '../../types';
import { get } from '../api';

const response = [
  {
    code: 'explore',
    name: 'Explore',
    parentEntityCode: null,
  },
  {
    code: 'TO',
    name: 'Tonga',
    parentEntityCode: 'explore',
  },
  {
    code: 'TO_Tongatapu',
    name: 'Tongatapu',
    parentEntityCode: 'TO',
  },
];
export const useEntityAncestors = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  return useQuery(
    ['entityAncestors', projectCode, entityCode],
    () =>
      get(`entityAncestors/${projectCode}/${entityCode}`, { params: { includeRootEntity: true } }),
    {
      enabled: !!projectCode && !!entityCode,
    },
  );
};
