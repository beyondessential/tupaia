/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { useUser } from '../queries';

export const useLogin = () => {
  const queryClient = useQueryClient();

  const loginQuery = useMutation(
    ({ email, password }) =>
      post('login', {
        data: {
          emailAddress: email,
          password,
          deviceName: window.navigator.userAgent,
        },
      }),
    {
      onSuccess: () => {
        queryClient.resetQueries('user');
        queryClient.resetQueries('entity');
        queryClient.resetQueries('entities');
      },
    },
  );

  const userQuery = useUser({ enabled: loginQuery.isSuccess });

  if (loginQuery.isSuccess) {
    return { ...loginQuery, ...userQuery };
  }

  return loginQuery;
};
