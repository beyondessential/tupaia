/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntity = (entityId: string, { enabled, onSuccess, staleTime }) => {
  return useQuery(['entity', entityId], (): Promise<any> => get(`entities/${entityId}`), {
    enabled,
    onSuccess,
    staleTime,
  });
};
