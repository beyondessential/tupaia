/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { ProjectCode, Entity } from '../../types';
import { get } from '../api';

export const useEntitySearch = (projectCode?: ProjectCode, searchString?: string) => {
  return useQuery(
    ['entity', projectCode, searchString],
    async (): Promise<Entity[]> => {
      return get(`entitySearch/${projectCode}`, {
        params: { searchString },
      });
    },
    { enabled: !!projectCode },
  );
};
