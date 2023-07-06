/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions } from 'react-query';
import { EntityResponse } from '../../types';
import { get } from '../api';

type EntitiesResponse = EntityResponse[];

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
    async (): Promise<EntitiesResponse> => {
      return get(`entities/${projectCode}/${entityCode}`, {
        params: {
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
      });
    },
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
        ...{ ...axiosConfig?.params },
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
      },
    },
    queryOptions,
  );
