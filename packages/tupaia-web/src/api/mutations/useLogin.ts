import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Location, useLocation, useNavigate } from 'react-router';
import { getBrowserTimeZone } from '@tupaia/utils';
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
      return post('loginUser', {
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
        gaEvent('User', 'Log in', 'Attempt');
      },
      onSuccess: data => {
        gaEvent('User', 'Login', 'success');
        queryClient.invalidateQueries();
        // if the user was redirected to the login page, redirect them back to the page they were on
        if (location.state?.referrer) {
          navigate(location.state.referrer, {
            state: null,
          });
        } else if (location.pathname.includes(DEFAULT_PROJECT_ENTITY)) {
          if (data.project) {
            const { code, homeEntityCode, dashboardGroupName } = data.project;
            navigate(`/${code}/${homeEntityCode}/${dashboardGroupName}`);
          } else {
            navigateToModal(MODAL_ROUTES.PROJECTS);
          }
        } else {
          closeModal();
        }
      },
    },
  );
};
