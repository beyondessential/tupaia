/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions } from '@tanstack/react-query';
import { get } from '../api';
import { Entity } from '../../types';

type QueryOptions = QueryObserverOptions<Entity[], Error, Entity[]>;

export const useEntities = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryOptions,
) => {
  let enabled = !!projectCode && !!entityCode;

  if (queryOptions?.enabled !== undefined) {
    enabled = enabled && queryOptions.enabled;
  }

  return useQuery(
    ['entities', projectCode, entityCode, axiosConfig, queryOptions],
    (): Promise<Entity[]> =>
      get(`entities/${projectCode}/${entityCode}`, {
        params: {
          includeRootEntity: true,
          fields: [
            'parent_code',
            'code',
            'name',
            'type',
            'point',
            'image_url',
            'attributes',
            'child_codes',
          ],
        },
        ...axiosConfig,
      }),

    {
      enabled,
      keepPreviousData: !!queryOptions?.keepPreviousData, // this needs to be false unless otherwise set, otherwise when we change the entity code, the previous data will be returned for a while
      select: queryOptions?.select,
    },
  );
};

export const useEntitiesWithLocation = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions: QueryOptions = {},
) => {
  return useEntities(
    projectCode,
    entityCode,
    {
      params: {
        includeRootEntity: true,
        fields: [
          'parent_code',
          'code',
          'name',
          'type',
          'bounds',
          'region',
          'point',
          'location_type',
          'image_url',
          'attributes',
          'child_codes',
        ],
        ...{ ...axiosConfig?.params },
      },
    },
    {
      keepPreviousData: false, // this needs to be false by default, unless otherwise set, otherwise when we change the entity code, the previous data will be returned for a while
      ...queryOptions,
    },
  );
};
