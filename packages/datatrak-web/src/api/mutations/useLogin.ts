/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { post } from '../api';
import { ROUTES } from '../../constants';

type LoginCredentials = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const queryClient = useQueryClient();
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
      onSuccess: ({ user }) => {
        queryClient.invalidateQueries();
        const path = user?.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT;
        navigate(path);
      },
    },
  );
};
