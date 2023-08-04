/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { SingleProject } from '../../types';
import { get } from '../api';
import { useUser } from './useUser';
import { useModal } from '../../utils';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';

export const useProject = (projectCode?: string) => {
  const { isLoggedIn } = useUser();
  const { navigateToModal, navigateToLogin } = useModal();
  return useQuery(
    ['project', projectCode],
    (): Promise<SingleProject> => get(`project/${projectCode}`, {}),
    {
      enabled: !!projectCode,
      onSuccess: (data: SingleProject) => {
        if (data?.hasAccess) return;
        if (isLoggedIn)
          return navigateToModal(MODAL_ROUTES.REQUEST_PROJECT_ACCESS, [
            {
              param: URL_SEARCH_PARAMS.PROJECT,
              value: projectCode!,
            },
          ]);
        return navigateToLogin();
      },
    },
  );
};
