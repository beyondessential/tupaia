/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { AxiosRequestConfig } from 'axios';
import { useQuery, QueryObserverOptions, QueryOptions } from 'react-query';
import { get } from '../api';

export const useLegacyMapOverlay = (
  overlayCode: string | null,
  axiosConfig?: AxiosRequestConfig,
  queryOptions?: QueryObserverOptions,
) => {
  return useQuery(
    ['legacyMapOverlayReport', overlayCode, axiosConfig, queryOptions],
    async (): Promise<any> => {
      return get(`legacyMapOverlayReport/${overlayCode}`, axiosConfig);
    },
    {
      enabled: !!overlayCode,
      ...queryOptions,
    } as QueryOptions,
  );
};
