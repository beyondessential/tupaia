/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions } from 'react-query';
import { EntityResponse } from '../../types';
import { get } from '../api';

export const useEntities = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryObserverOptions,
) => {
  const enabled =
    queryOptions?.enabled === undefined ? !!projectCode && !!entityCode : queryOptions.enabled;

  return useQuery(
    ['entities', projectCode, entityCode, axiosConfig, queryOptions],
    async (): Promise<EntityResponse> => {
      return get(`entities/${projectCode}/${entityCode}`, axiosConfig);
    },
    {
      enabled,
    },
  );
};

export const useEntitiesWithLocation = (projectCode?: string, entityCode?: string) =>
  useEntities(projectCode, entityCode, {
    params: { fields: ['parent_code', 'code', 'name', 'type', 'bounds', 'region'] },
  });
