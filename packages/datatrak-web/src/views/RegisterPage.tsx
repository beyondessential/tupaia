import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { RegisterForm } from '@tupaia/ui-components';
import { useRegister } from '../api';
import { ROUTES } from '../constants';

export const RegisterPage = () => {
  const { mutate: register, isLoading, error, isSuccess } = useRegister();
  return (
    <RegisterForm
      onSubmit={register as SubmitHandler<any>}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      loginLink={ROUTES.LOGIN}
      verifyResendLink={ROUTES.VERIFY_EMAIL_RESEND}
      successMessage="Congratulations, you have successfully signed up to Tupaia. To activate your account please click the verification link in your email. Once activated, you can use your new account to log into our app Tupaia Meditrak on iOS and Android."
    />
  );
};
