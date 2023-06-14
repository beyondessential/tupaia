/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useNavigate } from 'react-router-dom';

export const useHash = () => {
  const navigate = useNavigate();
  const { hash, ...location } = useLocation();

  function navigateToHash(hashKey: string) {
    navigate({ ...location, hash: hashKey });
  }
  function clearHash() {
    navigate(location);
  }
  return { hash: hash.substring(1), clearHash, navigateToHash };
};
