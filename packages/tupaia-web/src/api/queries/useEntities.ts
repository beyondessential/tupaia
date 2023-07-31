/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions } from 'react-query';
import { Entity } from '../../types';
import { get } from '../api';

type EntitiesResponse = Entity[];

export const useEntities = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryObserverOptions,
) => {
  let enabled = !!projectCode && !!entityCode;

  if (queryOptions?.enabled !== undefined) {
    enabled = enabled && queryOptions.enabled;
  }

  return useQuery(
    ['entities', projectCode, entityCode, axiosConfig, queryOptions],
    (): Promise<EntitiesResponse> =>
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
    },
  );
};

export const useEntitiesWithLocation = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryObserverOptions,
) =>
  useEntities(
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
    queryOptions,
  );
