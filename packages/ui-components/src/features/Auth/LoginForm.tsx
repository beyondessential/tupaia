/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LinkProps } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthFormTextField } from './AuthFormTextField';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { RouterLink } from '../RouterLink';
import { FormInput, Form } from '../Form';
import { EmailVerificationDisplay, Message } from './EmailVerificationDisplay';
import { AuthSubmitButton } from './AuthSubmitButton';
import { AuthLink } from './AuthLink';

const Wrapper = styled(AuthViewWrapper)`
  width: 38rem;
`;

const StyledForm = styled(Form)`
  margin-top: 2.4rem;
  width: 22rem;
  max-width: 100%;
  .MuiFormControl-root:nth-child(2) {
    margin-bottom: 0;
  }
`;

const ForgotPasswordText = styled(AuthLink)`
  margin-top: 0.5rem;
  float: right;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.text.primary};
`;

type To = LinkProps['to'];

interface LoginFormProps {
  onSubmit: SubmitHandler<any>;
  isLoading?: boolean;
  error?: Error | null;
  forgotPasswordLink: To;
  registerLink: To;
  message?: Message | null;
  formContext: ReturnType<typeof useForm>;
  className?: string;
}

export const LoginForm = ({
  onSubmit,
  isLoading,
  error,
  forgotPasswordLink,
  registerLink,
  message,
  formContext,
  className,
}: LoginFormProps) => {
  return (
    <Wrapper title="Log in" subtitle="Enter your details below to log in" className={className}>
      {error && <Typography color="error">{error.message}</Typography>}
      {message && <EmailVerificationDisplay message={message} />}
      <StyledForm onSubmit={onSubmit} formContext={formContext}>
        <FormInput
          name="email"
          type="email"
          options={FORM_FIELD_VALIDATION.EMAIL}
          required
          Input={AuthFormTextField}
          label="Email"
          disabled={isLoading}
        />
        <FormInput
          name="password"
          type="password"
          options={FORM_FIELD_VALIDATION.PASSWORD}
          required
          Input={AuthFormTextField}
          label="Password"
          disabled={isLoading}
        />

        <ForgotPasswordText as={RouterLink} to={forgotPasswordLink}>
          Forgot password?
        </ForgotPasswordText>
        <AuthSubmitButton type="submit" isLoading={isLoading}>
          Log in
        </AuthSubmitButton>
        <AuthLink>
          Don&rsquo;t have an account? <RouterLink to={registerLink}>Register here</RouterLink>
        </AuthLink>
      </StyledForm>
    </Wrapper>
  );
};
