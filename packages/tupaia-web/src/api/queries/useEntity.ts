/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { EntityCode, EntityResponse, ProjectCode } from '../../types';
import { get } from '../api';
import { DEFAULT_BOUNDS } from '../../constants';

export const useEntity = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
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
