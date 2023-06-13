/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { post } from '../api';

type LoginCredentials = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  return useMutation<any, Error, LoginCredentials, unknown>(
    ({ email, password }: LoginCredentials) => {
      return post('login', {
        data: {
          emailAddress: email,
          password,
          deviceName: window.navigator.userAgent,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        searchParams.delete('modal');
        setSearchParams(searchParams);
      },
    },
  );
};
