import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';
import { useHomeUrl } from '../../utils/useHomeUrl';

export const useLogout = () => {
  const { navigateToHomeUrl } = useHomeUrl();
  const queryClient = useQueryClient();

  return useMutation(() => post('logout'), {
    onSuccess: () => {
      queryClient.clear();
      navigateToHomeUrl();
    },
  });
};
