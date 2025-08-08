import { ForgotPasswordForm } from '@tupaia/ui-components';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useRequestResetPassword } from '../api/mutations';
import { RegisterLink } from '../authentication';
import { AUTH_ROUTES } from '../routes';

export const ForgotPasswordPage = () => {
  const formContext = useForm();
  const { mutate: onRequestResetPassword, isLoading, error, isSuccess } = useRequestResetPassword();
  return (
    <ForgotPasswordForm
      onSubmit={onRequestResetPassword}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      loginLink={AUTH_ROUTES.LOGIN}
      formContext={formContext}
      RegisterLinkComponent={<RegisterLink />}
    />
  );
};
