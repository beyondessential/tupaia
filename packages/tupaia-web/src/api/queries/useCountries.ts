/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { Country } from '@tupaia/types';
import { get } from '../api';

export const useCountries = () => {
  return useQuery(
    ['countries'],
    (): Promise<Country[]> =>
      get('countries', {
        params: {
          columns: JSON.stringify(['code', 'name']),
          sort: JSON.stringify(['name']),
          pageSize: 'ALL',
          // TL is turned off for Tupaia right now
          filter: JSON.stringify({
            code: {
              comparator: '!=',
              comparisonValue: 'TL',
            },
          }),
        },
      }),
  );
};
