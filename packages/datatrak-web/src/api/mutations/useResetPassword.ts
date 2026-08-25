import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PASSWORD_RESET_TOKEN_PARAM } from '../../constants';
import { post } from '../api';

export interface ResetPasswordParams {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

interface ResBody {
  message: string;
}

export const useResetPassword = (
  options?: UseMutationOptions<ResBody, Error, ResetPasswordParams, unknown>,
) => {
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const oneTimeLoginToken = urlSearchParams.get(PASSWORD_RESET_TOKEN_PARAM);

  return useMutation<ResBody, Error, ResetPasswordParams, unknown>(
    async ({ oldPassword, newPassword, newPasswordConfirm }: ResetPasswordParams) =>
      await post('me/changePassword', {
        data: { oldPassword, newPassword, newPasswordConfirm, oneTimeLoginToken },
      }),
    {
      meta: { applyCustomErrorHandling: true },
      ...options,
      onSuccess: (data: ResBody, variables, context) => {
        // manually navigate to the removed token - using setUrlParams seems to remove the hash as well in this one case
        urlSearchParams.delete(PASSWORD_RESET_TOKEN_PARAM);
        navigate(
          {
            ...location,
            search: urlSearchParams.toString(),
          },
          { replace: true },
        );
        options?.onSuccess?.(data, variables, context);
      },
    },
  );
};
