/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { RegisterForm as BaseRegisterForm } from '@tupaia/ui-components';
import { useRegister } from '../api/mutations';
import { ROUTES } from '../constants';

const RegisterForm = styled(BaseRegisterForm)`
  h2 {
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  }
  h3 {
    margin-top: 0.32rem;
  }
  form {
    margin-top: 4.3rem;
  }
  .MuiFormControl-root {
    margin-bottom: 1rem;
  }
  .MuiTypography-root.MuiFormControlLabel-label,
  .MuiTypography-root.MuiFormControlLabel-label a {
    font-size: 0.6875rem;
  }
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
  .MuiCheckbox-root {
    padding-right: 0.375rem;
  }
`;

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
