/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { LinkProps } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { Form, FormInput } from '../Form';
import { AuthSubmitButton } from './AuthSubmitButton';
import { RouterLink } from '../RouterLink';
import { AuthFormTextField } from './AuthFormTextField';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthErrorMessage } from './AuthErrorMessage';

const Wrapper = styled(AuthViewWrapper)<{
  $isSuccess?: boolean;
}>`
  width: 36rem;
  &.MuiPaper-root&.MuiPaper-rounded {
    padding-top: 2.5rem;
    padding-bottom: 4.2rem;
    max-height: ${({ $isSuccess }) => ($isSuccess ? '100%' : 'auto')};
    height: ${({ $isSuccess }) => ($isSuccess ? '27rem' : 'auto')};
    justify-content: ${({ $isSuccess }) => ($isSuccess ? 'space-between' : 'flex-start')};
  }
`;

const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 22rem;
  max-width: 100%;
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
  const baseFormInputs = [
    {
      name: 'newPassword',
      label: 'New password',
      options: FORM_FIELD_VALIDATION.PASSWORD,
    },
    {
      name: 'passwordConfirm',
      label: 'Confirm password',
      options: {
        validate: (value: string) =>
          value === formContext.getValues('newPassword') || 'Passwords do not match.',
      },
    },
  ];

  // Only display the 'current password' input if there is no reset token in the url, because that means the user is already logged in
  const formInputs = passwordResetToken
    ? baseFormInputs
    : [
        {
          name: 'oldPassword',
          label: 'Current password',
          options: FORM_FIELD_VALIDATION.PASSWORD,
        },
        ...baseFormInputs,
      ];
  return (
    <Wrapper
      $isSuccess={isSuccess}
      title="Reset password"
      subtitle={
        !isSuccess ? 'Enter your new password below' : 'Your password has successfully been reset'
      }
    >
      {error && <AuthErrorMessage>{error.message}</AuthErrorMessage>}
      <StyledForm onSubmit={onSubmit} formContext={formContext}>
        {!isSuccess && (
          <>
            {/** Only display the 'current password' input if there is no reset token in the url */}
            {formInputs.map(({ name, label, options }) => (
              <FormInput
                key={name}
                name={name}
                label={label}
                type="password"
                required
                options={options}
                disabled={isLoading}
                Input={AuthFormTextField}
              />
            ))}
            <AuthSubmitButton type="submit" isLoading={isLoading}>
              Change password
            </AuthSubmitButton>
          </>
        )}
        <AuthSubmitButton variant="outlined" component={RouterLink} to={loginLink}>
          Back to login
        </AuthSubmitButton>
      </StyledForm>
    </Wrapper>
  );
};
