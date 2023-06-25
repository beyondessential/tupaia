/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions, QueryOptions } from 'react-query';
import { Entity } from '@tupaia/types';
import { get } from '../api';

type EntityRecord = Entity & { children?: Entity[] };

type EntitiesResponse = EntityRecord[];

export const useEntities = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryObserverOptions,
) => {
  return useQuery(
    ['entities', projectCode, entityCode, axiosConfig, queryOptions],
    async (): Promise<EntitiesResponse> => {
      return get(`entities/${projectCode}/${entityCode}`, axiosConfig);
    },
    {
      enabled: !!projectCode && !!entityCode,
      ...queryOptions,
    } as QueryOptions,
  );
};
