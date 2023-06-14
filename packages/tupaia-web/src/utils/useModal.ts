/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { MODAL_ROUTES, PASSWORD_RESET_TOKEN_PARAM } from '../constants';

export const useModal = () => {
  const navigate = useNavigate();
  const { hash, ...location } = useLocation();
  const [urlParams] = useSearchParams();

  function navigateToModal(hashKey: `${MODAL_ROUTES}`) {
    navigate({ ...location, hash: hashKey });
  }
  function closeModal() {
    // Remove the password reset token from the url, if it is set
    if (urlParams.get(PASSWORD_RESET_TOKEN_PARAM)) {
      urlParams.delete(PASSWORD_RESET_TOKEN_PARAM);
    }
    navigate({
      ...location,
      search: urlParams.toString(), //
    });
  }
  return { hash: hash.substring(1), closeModal, navigateToModal };
};
