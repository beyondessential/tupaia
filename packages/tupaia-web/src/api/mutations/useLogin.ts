/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router';
import { useModal } from '../../utils';
import { post } from '../api';

type LoginCredentials = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const queryClient = useQueryClient();
  const location = useLocation() as { state: { referrer?: string } };
  const navigate = useNavigate();

  const { closeModal } = useModal();

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
        // if the user was redirected to the login page, redirect them back to the page they were on
        if (location.state?.referrer)
          navigate(location.state.referrer, {
            state: null,
          });
        else closeModal();
      },
    },
  );
};
