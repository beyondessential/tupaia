/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { Entity } from '../../types';
import { get } from '../api';

const getEntityNamesByCode = (entities: Entity[]) =>
  entities.reduce((acc, entity) => {
    acc[entity.code] = entity.name;
    return acc;
  }, {});

export const useEntities = (codes?: string[]) => {
  const query = useQuery(
    ['entities', codes],
    (): Promise<Entity> =>
      get(`entities`, {
        params: {
          filter: JSON.stringify({ code: codes }),
        },
      }),
    {
      enabled: !!codes,
    },
  );

  const entityNamesByCode = query.data ? getEntityNamesByCode(query.data) : {};
  return { ...query, entityNamesByCode };
};
