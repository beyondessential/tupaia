/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useUser = () => {
  const userResponse = useQuery(
    'getUser',
    (): Promise<{
      email: string;
      name: string;
    }> => get('getUser'),
  );
  const { data } = userResponse;

  return {
    ...userResponse,
    data,
    isLoggedIn: !!data?.email,
  };
};
