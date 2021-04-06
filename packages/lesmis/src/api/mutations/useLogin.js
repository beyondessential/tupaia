/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  const query = useMutation(
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

  return query;
};
