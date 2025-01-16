import { useMutation } from '@tanstack/react-query';
import { post } from '../api';

type RequestBody = {
  email: string;
};
export const useResendVerificationEmail = () => {
  return useMutation<any, Error, RequestBody, unknown>(
    ({ email }: RequestBody) => {
      return post('resendEmail', {
        data: {
          emailAddress: email,
        },
      });
    },
    {
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
