import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gaEvent, useFromLocation } from '../../utils';
import { useNavigate } from 'react-router-dom';
import { post } from '../api';
import { ROUTES } from '../../constants';
import { getBrowserTimeZone } from '@tupaia/utils';

type LoginCredentials = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const from = useFromLocation();

  return useMutation<any, Error, LoginCredentials, unknown>(
    ({ email, password }: LoginCredentials) => {
      return post('login', {
        data: {
          emailAddress: email,
          password,
          deviceName: window.navigator.userAgent,
          timezone: getBrowserTimeZone(),
        },
      });
    },
    {
      onMutate: () => {
        gaEvent('login', 'Login', 'Attempt');
      },
      onSuccess: async ({ user }) => {
        await queryClient.invalidateQueries();
        await queryClient.removeQueries();

        if (from) {
          navigate(from, { state: null });
        } else {
          const path = user.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT;
          navigate(path, { state: from });
        }
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
