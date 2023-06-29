/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Entity } from '../../types';
import { get } from '../api';
import { DEFAULT_BOUNDS } from '../../constants';

export const useEntity = (entityCode?: string) => {
  //  Todo: use entity endpoint when it's done and remove project code
  const { projectCode } = useParams();

  return useQuery(
    ['entities', projectCode, entityCode],
    async (): Promise<Entity> => {
      const entities = await get(`entities/${projectCode}/${entityCode}`, {
        params: {
          includeRoot: true,
          fields: ['parent_code', 'code', 'name', 'type', 'bounds', 'region', 'image_url'],
        },
      });
      // @ts-ignore
      const entity = entities.find(e => e.code === entityCode);

      if (entity.code === 'explore') {
        return { ...entity, bounds: DEFAULT_BOUNDS };
      }

      return entity;
    },
  );
};
