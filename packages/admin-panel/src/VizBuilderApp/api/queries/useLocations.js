/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useLocations = (project, search) =>
  useQuery(
    ['hierarchy', project, search],
    () => get(`hierarchy/${project}/${project}`, { params: { search, fields: 'name,code' } }),
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
    },
  );
