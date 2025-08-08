import { useMutation } from '@tanstack/react-query';
import { post } from '../../VizBuilderApp/api';

export const useRequestResetPassword = () => {
  return useMutation(({ emailAddress }) => {
    return post('requestResetPassword', {
      data: {
        emailAddress,
        resetPasswordUrl: window.location.origin,
      },
    });
  });
};
