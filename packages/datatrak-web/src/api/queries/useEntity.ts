/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntityById = (entityId: string, { enabled, onSuccess, staleTime }) => {
  return useQuery(['entity', entityId], (): Promise<any> => get(`entity/${entityId}`), {
    enabled,
    onSuccess,
    staleTime,
  });
};

export const useEntityByCode = (entityCode: string) => {
  return useQuery(['entity', entityCode], (): Promise<any> => get(`entity/${entityCode}`));
};
