/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';

type EntityFilters = {
  type?: string;
  parentId?: string;
  grandParentId?: string;
  searchString?: string;
  countryCode?: string;
};
export const useEntities = (projectCode?: string, params?: EntityFilters) => {
  return useQuery(
    ['entities', projectCode, params],
    (): Promise<any> => get(`entities/${projectCode}`, { params }),
  );
};
