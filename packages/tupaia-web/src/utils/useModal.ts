/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useNavigate } from 'react-router-dom';

export const useModal = () => {
  const navigate = useNavigate();
  const { hash, ...location } = useLocation();

  function navigateToModal(hashKey: string) {
    navigate({ ...location, hash: hashKey });
  }
  function closeModal() {
    navigate(location);
  }
  return { hash: hash.substring(1), closeModal, navigateToModal };
};
