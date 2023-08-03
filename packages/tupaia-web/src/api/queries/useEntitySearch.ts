/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { ProjectCode, Entity } from '../../types';
import { get } from '../api';
import { useDebounce } from '../../utils';

export const useEntitySearch = (
  projectCode?: ProjectCode,
  searchString?: string,
  pageSize: number = 5,
) => {
  const debouncedSearch = useDebounce(searchString!, 300);

  return useQuery(
    ['entity', projectCode, debouncedSearch, pageSize],
    async (): Promise<Entity[]> => {
      return get(`entitySearch/${projectCode}`, {
        params: { searchString: debouncedSearch, pageSize },
      });
    },
    { enabled: !!projectCode },
  );
};
