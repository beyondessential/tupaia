/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { ForgotPasswordForm } from '@tupaia/ui-components';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useRequestResetPassword } from '../api/mutations';
import { RegisterLink } from '../authentication';

export const ForgotPasswordPage = () => {
  const formContext = useForm();
  const { mutate: onRequestResetPassword, isLoading, error, isSuccess } = useRequestResetPassword();
  return (
    <ForgotPasswordForm
      onSubmit={onRequestResetPassword}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      loginLink="/login"
      formContext={formContext}
      RegisterLinkComponent={<RegisterLink />}
    />
  );
};
