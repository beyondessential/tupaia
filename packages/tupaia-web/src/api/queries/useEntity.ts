/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { EntityCode, ProjectCode, Entity } from '../../types';
import { get } from '../api';
import { DEFAULT_BOUNDS } from '../../constants';
import { useHandleNoAccessError } from '../../utils';

export const useEntity = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  const handleNoAccessError = useHandleNoAccessError(false);
  return useQuery(
    ['entity', projectCode, entityCode],
    async (): Promise<Entity> => {
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
    {
      enabled: !!entityCode && !!projectCode,
      onError: (e: any) => {
        if (e.code === 403) {
          handleNoAccessError();
        }
      },
    },
  );
};
