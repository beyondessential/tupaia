/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useUser = () => {
  const userResponse = useQuery('getUser', () => get('getUser'));
  const { data: user } = userResponse;

  const name = `${user?.first_name} ${user?.last_name}`;

  return {
    ...userResponse,
    data: { ...user, name },
    isLoggedIn: !!user?.email,
  };
};
