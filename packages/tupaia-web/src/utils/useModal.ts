/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { MODAL_ROUTES } from '../constants';
import { removeParamsFromSearch } from '.';

export const useModal = () => {
  const navigate = useNavigate();
  const { hash, ...location } = useLocation();

  function navigateToModal(hashKey: `${MODAL_ROUTES}`) {
    navigate({ ...location, hash: hashKey });
  }
  function closeModal(urlParamsToRemove?: string[]) {
    navigate({
      ...location,
      search: removeParamsFromSearch(urlParamsToRemove),
    });
  }
  return { hash: hash.substring(1), closeModal, navigateToModal };
};
