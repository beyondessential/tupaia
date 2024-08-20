/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { Project } from '@tupaia/types';
import { Entity } from '../../types';
import { get } from '../api';

export const useEntityAncestors = (projectCode?: Project['code'], entityCode?: Entity['code']) => {
  return useQuery(
    ['entityAncestors', projectCode, entityCode],
    (): Promise<Entity[]> => get(`entityAncestors/${projectCode}/${entityCode}`),
    {
      enabled: !!projectCode && !!entityCode,
    },
  );
};
