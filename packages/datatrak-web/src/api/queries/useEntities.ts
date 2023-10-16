/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { get } from '../api';

export const useEntities = (projectCode?: string, params?: DatatrakWebEntitiesRequest.ReqBody) => {
  return useQuery(
    ['entities', projectCode, params],
    (): Promise<DatatrakWebEntitiesRequest.ResBody> =>
      get('entities', { params: { filter: { ...params, projectCode } } }),
    { enabled: !!projectCode },
  );
};
