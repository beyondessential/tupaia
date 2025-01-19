import { useMutation } from '@tanstack/react-query';
import { post } from '../api';

type ResetPasswordParams = {
  emailAddress: string;
};
export const useRequestResetPassword = () => {
  return useMutation<any, Error, ResetPasswordParams, unknown>(
    ({ emailAddress }: ResetPasswordParams) => {
      return post('requestResetPassword', {
        data: {
          emailAddress,
        },
      });
    },
  );
};
