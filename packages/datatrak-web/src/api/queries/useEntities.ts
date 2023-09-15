/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntities = (projectCode?: string, entityCode?: string, params?: any) => {
  return useQuery(
    ['entities', projectCode, entityCode, params],
    (): Promise<any> => get(`entities/${projectCode}/${entityCode}`, { params }),
  );
};
