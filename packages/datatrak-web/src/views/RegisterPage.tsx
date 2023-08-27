/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RegisterForm } from '@tupaia/ui-components';
import { useRegister } from '../api/mutations';
import { ROUTES } from '../constants';

export const RegisterPage = () => {
  const formContext = useForm();
  const { mutate: register, isLoading, error, isSuccess } = useRegister();
  return (
    <RegisterForm
      onSubmit={register as SubmitHandler<any>}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      loginLink={ROUTES.LOGIN}
      formContext={formContext}
      verifyResendLink={ROUTES.VERIFY_EMAIL_RESEND}
      successMessage="Congratulations, you have successfully signed up to Tupaia. To activate your account please click the verification link in your email. Once activated, you can use your new account to log into our app Tupaia Meditrak on iOS and Android."
    />
  );
};
