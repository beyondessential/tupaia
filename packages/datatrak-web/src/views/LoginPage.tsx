/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { LoginForm as BaseLoginForm, EMAIL_VERIFICATION_STATUS } from '@tupaia/ui-components';
import { useLogin } from '../api/mutations';
import { ROUTES } from '../constants';

const LoginForm = styled(BaseLoginForm)`
  form {
    margin-top: 2.4rem;
    > a {
      font-size: 0.75rem;
    }
  }
  .MuiFormControl-root:nth-child(2) {
    margin-bottom: 0.7rem;
  }
`;
export const LoginPage = ({
  message,
}: {
  message?: {
    status?: EMAIL_VERIFICATION_STATUS | string;
    text?: string;
  } | null;
}) => {
  const formContext = useForm();
  const { mutate: login, isLoading, error } = useLogin();
  return (
    <LoginForm
      onSubmit={login as SubmitHandler<any>}
      isLoading={isLoading}
      error={error}
      forgotPasswordLink={ROUTES.FORGOT_PASSWORD}
      registerLink={ROUTES.REGISTER}
      formContext={formContext}
      message={message}
      className="auth-page"
    />
  );
};
