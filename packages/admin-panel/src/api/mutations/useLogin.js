import { getBrowserTimeZone } from '@tupaia/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { post } from '../../VizBuilderApp/api';

export const useLogin = homeLink => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  return useMutation(
    ({ email, password }) => {
      return post('login', {
        data: {
          emailAddress: email,
          password,
          timezone: getBrowserTimeZone(),
        },
      });
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        if (from) {
          navigate(from, {
            state: null,
          });
        } else {
          navigate(homeLink, {
            state: null,
          });
        }
      },
    },
  );
};
