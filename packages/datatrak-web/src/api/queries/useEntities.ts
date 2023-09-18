/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { TupaiaWebEntitiesRequest } from '@tupaia/types';
import { get } from '../api';

export const useEntities = (projectCode?: string, params?: TupaiaWebEntitiesRequest.ReqBody) => {
  return useQuery(
    ['entities', projectCode, params],
    (): Promise<TupaiaWebEntitiesRequest.ResBody> =>
      get('entities', { params: { filter: { ...params, projectCode } } }),
  );
};
