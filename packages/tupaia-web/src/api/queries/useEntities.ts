/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntities = (projectCode: string, entityCode?: string, options?: any) => {
  return useQuery(
    ['entities', projectCode, entityCode],
    async () => {
      return get(`entities/${projectCode}/${entityCode}`);
    },
    options,
  );
};
