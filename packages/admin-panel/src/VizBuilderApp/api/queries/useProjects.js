/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from '@tanstack/react-query';

import { stringifyQuery } from '@tupaia/utils';

import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useProjects = columns =>
  useQuery(
    ['projects'],
    async () => {
      const defaultColumns = ['project.code', 'entity.name'];
      const endpoint = stringifyQuery(undefined, 'projects', {
        columns: JSON.stringify(columns || defaultColumns),
      });
      return get(endpoint);
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
    },
  );
