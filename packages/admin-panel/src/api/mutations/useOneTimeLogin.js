import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../VizBuilderApp/api';

export const useOneTimeLogin = () => {
  const queryClient = useQueryClient();
  return useMutation(
    token => {
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
    },
  );
};
