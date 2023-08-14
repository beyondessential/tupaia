/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { useLocation } from 'react-router';
import { EntityCode, ProjectCode, Entity } from '../../types';
import { get } from '../api';
import { DEFAULT_BOUNDS, MODAL_ROUTES } from '../../constants';
import { useModal } from '../../utils';
import { useUser } from './useUser';

export const useEntity = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
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
      enabled: !!entityCode && !!projectCode,
      onError: (e: any) => {
        if (e.code !== 403) return;
        if (!isLoggedIn) return navigateToLogin();
        if (location.hash === `#${MODAL_ROUTES.REQUEST_PROJECT_ACCESS}`) return;
        return navigateToModal(MODAL_ROUTES.REQUEST_COUNTRY_ACCESS);
      },
    },
  );
};
