import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ForgotPasswordForm } from '@tupaia/ui-components';
import { ROUTES } from '../constants';
import { useRequestResetPassword } from '../api/mutations';

export const ForgotPasswordPage = () => {
  const formContext = useForm();
  const { mutate: onRequestResetPassword, isLoading, error, isSuccess } = useRequestResetPassword();
  return (
    <ForgotPasswordForm
      onSubmit={onRequestResetPassword as SubmitHandler<any>}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      loginLink={ROUTES.LOGIN}
      formContext={formContext}
      registerLink={ROUTES.REGISTER}
    />
  );
};
