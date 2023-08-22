/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Location, useLocation, useNavigate } from 'react-router';
import { gaEvent, useModal } from '../../utils';
import { post } from '../api';
import { DEFAULT_PROJECT_ENTITY, MODAL_ROUTES } from '../../constants';

type LoginCredentials = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const queryClient = useQueryClient();
  const location = useLocation() as Location & { state: { referrer?: string } };

  const navigate = useNavigate();

  const { closeModal, navigateToModal } = useModal();

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
      onMutate: () => {
        gaEvent('User', 'Log in', 'Attempt');
      },
      onSuccess: () => {
        gaEvent('User', 'Login', 'success');
        queryClient.invalidateQueries();
        // if the user was redirected to the login page, redirect them back to the page they were on
        if (location.state?.referrer) {
          navigate(location.state.referrer, {
            state: null,
          });
        } else if (location.pathname.includes(DEFAULT_PROJECT_ENTITY)) {
          navigateToModal(MODAL_ROUTES.PROJECTS);
        } else {
          closeModal();
        }
      },
    },
  );
};
