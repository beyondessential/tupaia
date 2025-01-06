/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { Entity, EntityCode, ProjectCode } from '../../types';
import { get } from '../api';

export const useEntityAncestors = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  return useQuery(
    ['entityAncestors', projectCode, entityCode],
    (): Promise<Entity[]> =>
      get(`entityAncestors/${projectCode}/${entityCode}`, { params: { includeRootEntity: true } }),
    {
      enabled: !!projectCode && !!entityCode,
    },
  );
};
