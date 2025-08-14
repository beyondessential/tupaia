import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';

type OneTimeLoginToken = string;

export const useOneTimeLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, OneTimeLoginToken, unknown>(
    (token: OneTimeLoginToken) => {
      return post('login/oneTimeLogin', {
        data: {
          token,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
