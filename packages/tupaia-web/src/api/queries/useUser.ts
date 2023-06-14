/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useUser = () => {
  const userResponse = useQuery('getUser', () => get('getUser'));
  const { data } = userResponse;

  return {
    ...userResponse,
    isLoggedIn: data?.name !== undefined,
  };
};
