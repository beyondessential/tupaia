/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { MODAL_ROUTES } from '../constants';
import { gaEvent, removeUrlSearchParams } from '.';

export const useModal = () => {
  const navigate = useNavigate();
  const { hash, ...location } = useLocation();

  function navigateToModal(
    hashKey: MODAL_ROUTES,
    urlSearchParams?: {
      param: string;
      value: string;
    }[],
  ) {
    const searchParams = new URLSearchParams(location.search);
    if (urlSearchParams) {
      urlSearchParams.forEach(({ param, value }) => {
        searchParams.set(param, value);
      });
    }
    navigate({ ...location, hash: hashKey, search: searchParams.toString() });
  }
  function closeModal(urlSearchParamsToRemove?: string[]) {
    gaEvent('User', 'Close Dialog');
    navigate({
      ...location,
      search: removeUrlSearchParams(urlSearchParamsToRemove),
    });
  }
  function navigateToLogin() {
    navigateToModal(MODAL_ROUTES.LOGIN);
  }
  return { hash: hash.substring(1), closeModal, navigateToModal, navigateToLogin };
};
