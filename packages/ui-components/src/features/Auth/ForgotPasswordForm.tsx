/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LinkProps } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { AuthSubmitButton } from './AuthSubmitButton';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { RouterLink } from '../RouterLink';
import { Form, FormInput } from '../Form';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthFormTextField } from './AuthFormTextField';

const Wrapper = styled(AuthViewWrapper)<{
  $isSuccess?: boolean;
}>`
  width: 36rem;
  &.MuiPaper-root {
    padding-top: 2.5rem;
    padding-bottom: 4.2rem;
    max-height: ${({ $isSuccess }) => ($isSuccess ? '100%' : 'auto')};
    height: ${({ $isSuccess }) => ($isSuccess ? '27rem' : 'auto')};
    justify-content: ${({ $isSuccess }) => ($isSuccess ? 'center' : 'flex-start')};
  }
`;

const StyledForm = styled(Form)`
  margin-top: 2.5rem;
  width: 22rem;
  max-width: 100%;
`;

const SubmitButton = styled(AuthSubmitButton)`
  margin-top: 2.3rem;
`;

const LinkText = styled(Typography)`
  font-size: 0.8125rem;

  a {
    color: ${props => props.theme.palette.text.primary};
  }
`;

interface ForgotPasswordFormProps {
  isLoading: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  formContext: ReturnType<typeof useForm>;
  onSubmit: SubmitHandler<any>;
  loginLink: LinkProps['to'];
  registerLink: LinkProps['to'];
}

export const ForgotPasswordForm = ({
  onSubmit,
  isLoading,
  error,
  isSuccess,
  formContext,
  loginLink,
  registerLink,
}: ForgotPasswordFormProps) => {
  const HEADING_TEXT = {
    title: 'Forgot password',
    subtitle: 'Enter your email below to reset your password',
  };
  if (isSuccess) {
    HEADING_TEXT.title = 'Forgot password email sent';
    HEADING_TEXT.subtitle =
      'Please check your email for further information on how to reset your password';
  }
  return (
    <Wrapper title={HEADING_TEXT.title} subtitle={HEADING_TEXT.subtitle} $isSuccess={isSuccess}>
      {error && <Typography color="error">{error.message}</Typography>}
      {!isSuccess && (
        <StyledForm onSubmit={onSubmit} formContext={formContext}>
          <FormInput
            Input={AuthFormTextField}
            name="emailAddress"
            label="Email"
            type="email"
            required
            options={FORM_FIELD_VALIDATION.EMAIL}
            disabled={isLoading}
          />
          <SubmitButton type="submit" isLoading={isLoading}>
            Reset password
          </SubmitButton>
          <AuthSubmitButton to={loginLink} variant="outlined" component={RouterLink}>
            Back to log in
          </AuthSubmitButton>
          <LinkText align="center">
            Don't have an account? <RouterLink to={registerLink}>Register here</RouterLink>
          </LinkText>
        </StyledForm>
      )}
    </Wrapper>
  );
};
