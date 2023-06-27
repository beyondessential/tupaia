/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { get } from '../api';
import { useCancellableQuery } from './useCancellableQuery';

export const useEntities = (projectCode: string, entityCode?: string, options?: any) => {
  return useCancellableQuery(
    ['entities', projectCode, entityCode],
    async () => {
      return get(`entities/${projectCode}/${entityCode}`);
    },
    options,
  );
};
