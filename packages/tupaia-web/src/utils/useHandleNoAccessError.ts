/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useParams } from 'react-router';
import { useModal } from '.';
import { useUser } from '../api/queries';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../constants';

/**
 * Returns a function that redirects the user to the login page or the request access modal(s). Needs to be a hook format because it uses hooks inside it.
 */
export const useHandleNoAccessError = (isProject: boolean) => {
  const { isLoggedIn } = useUser();
  const { projectCode } = useParams();
  const location = useLocation();
  const { navigateToLogin, navigateToModal } = useModal();

  const METHODS = {
    // If the user is already on the login page, don't redirect them again
    login: location.hash === `#${MODAL_ROUTES.LOGIN}` ? null : navigateToLogin,
    // If the error is from a project, redirect to the request project access modal
    project: () =>
      navigateToModal(MODAL_ROUTES.REQUEST_PROJECT_ACCESS, [
        {
          param: URL_SEARCH_PARAMS.PROJECT,
          value: projectCode!,
        },
      ]),
    // If the error is from a country, redirect to the request country access modal. However if the user is already on the request project access modal, don't redirect them again.
    country:
      location.hash === `#${MODAL_ROUTES.REQUEST_PROJECT_ACCESS}`
        ? null
        : () => navigateToModal(MODAL_ROUTES.REQUEST_COUNTRY_ACCESS),
  };

  return () => {
    const errorHandler = isLoggedIn ? METHODS[isProject ? 'project' : 'country'] : METHODS.login;
    if (errorHandler) errorHandler();
  };
};
