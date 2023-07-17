/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { EntityResponse } from '../../types';
import { get } from '../api';
import { DEFAULT_BOUNDS } from '../../constants';

export const useEntity = (entityCode?: string) => {
  //  Todo: use entity endpoint when it's done and remove project code
  const { projectCode } = useParams();

  return useQuery(
    ['entity', projectCode, entityCode],
    async (): Promise<EntityResponse> => {
      const entity = await get(`entity/${projectCode}/${entityCode}`, {
        params: {
          includeRoot: true,
          fields: ['parent_code', 'code', 'name', 'type', 'bounds', 'region', 'image_url'],
        },
      });

      if (entity.code === 'explore') {
        return { ...entity, bounds: DEFAULT_BOUNDS };
      }

      return entity;
    },
    { enabled: !!entityCode && !!projectCode },
  );
};
