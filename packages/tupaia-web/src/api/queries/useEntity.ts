/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router';
import { EntityCode, ProjectCode, Entity } from '../../types';
import { get } from '../api';
import { DEFAULT_BOUNDS, MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';
import { useModal } from '../../utils';
import { useUser } from './useUser';

export const useEntity = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  enabled?: boolean,
) => {
  const { isLoggedIn } = useUser();
  const { navigateToModal, navigateToLogin } = useModal();
  const location = useLocation();
  return useQuery(
    ['entity', projectCode, entityCode],
    async (): Promise<Entity> => {
      const entity = await get(`entity/${projectCode}/${entityCode}`, {
        params: {
          includeRoot: true,
          fields: ['parent_code', 'code', 'name', 'type', 'point', 'bounds', 'region', 'image_url'],
        },
      });

      if (entity.code === 'explore') {
        return { ...entity, bounds: DEFAULT_BOUNDS };
      }

      return entity;
    },
    {
      enabled: !!entityCode && !!projectCode && (enabled === undefined || !!enabled),
      onError: (e: any) => {
        if (e.code !== 403) return;
        if (!isLoggedIn) return navigateToLogin();
        if (location.hash === `#${MODAL_ROUTES.REQUEST_PROJECT_ACCESS}`) return;

        return navigateToModal(MODAL_ROUTES.REQUEST_PROJECT_ACCESS, [
          {
            param: URL_SEARCH_PARAMS.PROJECT,
            value: projectCode!,
          },
        ]);
      },
    },
  );
};

export const useEntityById = (
  projectCode?: ProjectCode,
  entityId?: string,
  fields = [
    'parent_code',
    'code',
    'name',
    'type',
    'point',
    'image_url',
    'attributes',
    'child_codes',
  ],
  onSuccess?: (data: Entity) => void,
) => {
  return useQuery(
    ['entities', projectCode, entityId, fields],
    async (): Promise<Entity> => {
      const results = await get(`entities/${projectCode}/${projectCode}`, {
        params: {
          filter: { id: entityId },
          fields,
        },
      });
      return results[0] ?? null;
    },
    {
      enabled: !!projectCode && !!entityId,
      onSuccess,
    },
  );
};
