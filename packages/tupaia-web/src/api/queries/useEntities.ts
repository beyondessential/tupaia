/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { Entity } from '../../types';
import { get } from '../api';

export const useEntities = (codes?: string[]) => {
  return useQuery(
    ['entities', codes],
    (): Promise<Entity> =>
      get(`entities`, {
        params: {
          codes,
        },
      }),
    {
      enabled: !!codes,
    },
  );
};
