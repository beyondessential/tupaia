import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../../VizBuilderApp/api';

export const useLogout = onSuccess => {
  const queryClient = useQueryClient();

  return useMutation(['logout'], () => post('logout'), {
    onSuccess: () => {
      queryClient.invalidateQueries();
      if (onSuccess) onSuccess();
    },
  });
};
