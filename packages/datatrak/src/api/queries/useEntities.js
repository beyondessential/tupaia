/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { get } from '../api';
import { REACT_QUERY_DEFAULTS } from '../constants';

export const useEntities = (hierarchy, type) => {
  return useQuery(
    ['entities', hierarchy, type],
    () =>
      get(`entities/${hierarchy}`, {
        params: {
          type,
        },
      }),
    {
      ...REACT_QUERY_DEFAULTS,
      enabled: hierarchy !== null,
    },
  );
};
