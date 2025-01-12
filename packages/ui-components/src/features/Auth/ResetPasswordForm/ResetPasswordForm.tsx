import React from 'react';
import styled from 'styled-components';
import { LinkProps } from 'react-router-dom-v6';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Paper } from '@material-ui/core';
import { AuthErrorMessage } from '../AuthErrorMessage';
import { PasswordForm } from './PasswordForm';
import { ResetPasswordSuccess } from './ResetPasswordSuccess';

const Wrapper = styled(Paper)`
  width: 36rem;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  > div {
    width: 100%;
  }
`;

interface ResetPasswordFormProps {
  isLoading: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  formContext: ReturnType<typeof useForm>;
  onSubmit: SubmitHandler<any>;
  passwordResetToken?: string | null;
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
    <Wrapper>
      {error && <AuthErrorMessage>{error.message}</AuthErrorMessage>}
      {isSuccess ? (
        <ResetPasswordSuccess loginLink={loginLink} />
      ) : (
        <PasswordForm
          passwordResetToken={passwordResetToken}
          onSubmit={onSubmit}
          isLoading={isLoading}
          formContext={formContext}
          loginLink={loginLink}
        />
      )}
    </Wrapper>
  );
};
