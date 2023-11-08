/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { post } from '../api';
import { ROUTES } from '../../constants';

type LoginCredentials = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const { from } = location.state as { from: string };

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
        if (from) {
          navigate(from, {
            state: null,
          });
        } else {
          const path = user?.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT;
          navigate(path);
        }
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
