/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../../VizBuilderApp/api/api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../../VizBuilderApp/api/constants';

export const useExternalDatabaseConnections = () =>
  useQuery(
    ['externalDatabaseConnections'],
    async () => {
      const response = await get('externalDatabaseConnections', {
        params: { columns: JSON.stringify(['code', 'name']) },
      });

      return response;
    },
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      keepPreviousData: true,
    },
  );
