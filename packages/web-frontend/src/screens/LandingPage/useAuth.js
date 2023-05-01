/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useSelector } from 'react-redux';

export const useAuth = () => {
  const authentication = useSelector(state => state.authentication);

  return { ...authentication };
};
