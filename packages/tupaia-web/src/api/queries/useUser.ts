/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { TupaiaWebUserRequest } from '@tupaia/types';
import { get } from '../api';

export const useUser = () => {
  const userResponse = useQuery(
    'getUser',
    (): Promise<TupaiaWebUserRequest.ResBody> => get('getUser'),
  );
  const { data: user } = userResponse;

  const name = user?.firstName ? `${user.firstName} ${user?.lastName}` : undefined;

  return {
    ...userResponse,
    data: { ...user, name },
    isLoggedIn: !!user?.email,
  };
};
