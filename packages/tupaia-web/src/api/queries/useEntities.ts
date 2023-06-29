/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions } from 'react-query';
import { Entity } from '../../types';
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
    ['entities', projectCode, entityCode, axiosConfig],
    (): Promise<Entity[]> =>
      get(`entities/${projectCode}/${entityCode}`, {
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
      }),
    {
      enabled,
    },
  );
};

export const useEntitiesWithLocation = (projectCode?: string, entityCode?: string) =>
  useEntities(projectCode, entityCode, {
    params: {
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
  });
