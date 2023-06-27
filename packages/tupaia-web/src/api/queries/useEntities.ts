/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions, QueryOptions } from 'react-query';
import { Entity } from '@tupaia/types';
import { get } from '../api';

type EntityResponse = Entity & { children?: Entity[] };

export const useEntities = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryObserverOptions,
) => {
  return useQuery(
    ['entities', projectCode, entityCode, axiosConfig, queryOptions],
    async (): Promise<EntityResponse> => {
      return get(`entities/${projectCode}/${entityCode}`, axiosConfig);
    },
    {
      enabled: !!projectCode && !!entityCode,
      ...queryOptions,
    } as QueryOptions,
  );
};

export const useEntitiesWithLocation = (projectCode?: string, entityCode?: string) =>
  useEntities(projectCode, entityCode, {
    params: { fields: ['parent_code', 'code', 'name', 'type', 'bounds', 'region'] },
  });
