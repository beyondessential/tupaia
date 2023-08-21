/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Location, useLocation, useNavigate } from 'react-router';
import { post } from '../api';

type LoginCredentials = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const queryClient = useQueryClient();
  const location = useLocation() as Location & { state: { referrer?: string } };

  const navigate = useNavigate();

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
      },
    },
  );
};
