/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { useUser } from '../queries';

export const useRegister = () => {
  const query = useMutation(
    ({
      firstName,
      lastName,
      emailAddress,
      contactNumber,
      employer,
      position,
      password,
      passwordConfirm,
    }) =>
      post('register', {
        data: {
          firstName,
          lastName,
          emailAddress,
          contactNumber,
          employer,
          position,
          password,
          passwordConfirm,
          deviceName: window.navigator.userAgent,
        },
      }),
    {
      onSuccess: () => {
        // queryClient.resetQueries('user');
        // queryClient.resetQueries('entity');
        // queryClient.resetQueries('entities');
      },
    },
  );
  console.log('query', query);

  return query;
};
