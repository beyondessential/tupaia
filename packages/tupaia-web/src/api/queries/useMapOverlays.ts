/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions, QueryOptions } from 'react-query';
import { get } from '../api';

export const useMapOverlays = (
  projectCode?: string,
  entityCode?: string,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryObserverOptions,
) => {
  return useQuery(
    ['mapOverlays', projectCode, entityCode, axiosConfig, queryOptions],
    async (): Promise<any> => {
      return get(`mapOverlays/${projectCode}/${entityCode}`, axiosConfig);
    },
    {
      enabled: !!projectCode && !!entityCode,
      ...queryOptions,
    } as QueryOptions,
  );
};
