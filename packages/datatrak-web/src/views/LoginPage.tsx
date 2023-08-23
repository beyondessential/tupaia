/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginForm, STATUS } from '@tupaia/ui-components';
import { useLogin } from '../api/mutations';
import { ROUTES } from '../constants';

export const LoginPage = ({
  message,
}: {
  message?: {
    status?: STATUS | string;
    text?: string;
  };
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
    />
  );
};
