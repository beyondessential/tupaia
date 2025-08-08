import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { SingleProject } from '../../types';
import { get } from '../api';
import { useUser } from './useUser';
import { useModal } from '../../utils';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';

export const useProject = (projectCode?: string) => {
  const { isLoggedIn } = useUser();
  const location = useLocation();
  const { navigateToModal, navigateToLogin } = useModal();
  return useQuery<SingleProject>(['project', projectCode], () => get(`project/${projectCode}`), {
    enabled: !!projectCode,
    keepPreviousData: false, // this needs to be false, otherwise when we change project, the old one is returned for until the new data is fetched, which leads to extra requests to the wrong project+entity code
    onSuccess: data => {
      const locationIsRequestAccess =
        location.hash.replace(/^#/, '') === MODAL_ROUTES.REQUEST_PROJECT_ACCESS;

      if (data?.hasAccess || locationIsRequestAccess) {
        return;
      }

      if (isLoggedIn && !locationIsRequestAccess) {
        return navigateToModal(MODAL_ROUTES.REQUEST_PROJECT_ACCESS, [
          {
            param: URL_SEARCH_PARAMS.PROJECT,
            value: projectCode!,
          },
        ]);
      }
      return navigateToLogin();
    },
  });
};
