/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { LinkProps } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { TextField } from '../../components';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { Form, FormInput } from '../Form';
import { AuthSubmitButton } from './AuthSubmitButton';
import { RouterLink } from '../RouterLink';

const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 22rem;
  max-width: 100%;
`;

const SuccessMessage = styled.p`
  text-align: center;
  padding: 0 0.9375rem;
`;

interface ResetPasswordFormProps {
  isLoading: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  formContext: ReturnType<typeof useForm>;
  onSubmit: SubmitHandler<any>;
  passwordResetToken?: string;
  loginLink: LinkProps['to'];
}

export const ResetPasswordForm = ({
  passwordResetToken,
  onSubmit,
  isSuccess,
  error,
  isLoading,
  formContext,
  loginLink,
}: ResetPasswordFormProps) => {
  return (
    <>
      {error && <Typography color="error">{error.message}</Typography>}
      {isSuccess ? (
        <SuccessMessage>Your password has been updated</SuccessMessage>
      ) : (
        <StyledForm onSubmit={onSubmit} formContext={formContext}>
          {/** Only display the 'current password' input if there is no reset token in the url */}
          {!passwordResetToken && (
            <FormInput
              name="oldPassword"
              label="Current password"
              type="password"
              required
              Input={TextField}
              options={FORM_FIELD_VALIDATION.PASSWORD}
              disabled={isLoading}
            />
          )}
          <FormInput
            name="newPassword"
            label="New password"
            type="password"
            required
            options={FORM_FIELD_VALIDATION.PASSWORD}
            disabled={isLoading}
            Input={TextField}
          />
          <FormInput
            name="passwordConfirm"
            label="Confirm password"
            type="password"
            required
            options={{
              validate: (value: string) =>
                value === formContext.getValues('newPassword') || 'Passwords do not match.',
            }}
            disabled={isLoading}
            Input={TextField}
          />
          <AuthSubmitButton
            variant="outlined"
            isLoading={isLoading}
            component={RouterLink}
            to={loginLink}
          >
            Back to login
          </AuthSubmitButton>
          <AuthSubmitButton type="submit" isLoading={isLoading}>
            Change password
          </AuthSubmitButton>
        </StyledForm>
      )}
    </>
  );
};
