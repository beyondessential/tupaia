/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { useNavigateBack } from '../../utils/useNavigateBack.ts';

type LoginCredentials = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigateBack = useNavigateBack();

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
        navigateBack();
      },
    },
  );
};
