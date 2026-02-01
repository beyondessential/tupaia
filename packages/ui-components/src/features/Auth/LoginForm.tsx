import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LinkProps } from 'react-router-dom-v6';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthFormTextField } from './AuthFormTextField';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { RouterLink } from '../RouterLink';
import { Form, FormInput } from '../Form';
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
  RegisterLinkComponent?: React.ReactNode;
  labels?: {
    title?: string;
    subtitle?: string;
    email?: string;
    password?: string;
    forgotPassword?: string;
    login?: string;
    dontHaveAnAccount?: string;
    register?: string;
  };
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
  RegisterLinkComponent,
  labels,
}: LoginFormProps) => {
  const showRegisterLink = registerLink || RegisterLinkComponent;
  const {
    title = 'Log in',
    subtitle = 'Enter your details below to log in',
    email = 'Email',
    password = 'Password',
    forgotPassword = 'Forgot password?',
    login = 'Log in',
    dontHaveAnAccount = 'Don’t have an account?',
    register = 'Register here',
  } = labels || {};
  return (
    <Wrapper title={title} subtitle={subtitle} className={className}>
      {error && <Typography color="error" align="center">{error.message}</Typography>}
      {message && <EmailVerificationDisplay message={message} />}
      <StyledForm onSubmit={onSubmit} formContext={formContext}>
        <FormInput
          autoComplete="email"
          autoFocus
          id="email"
          name="email"
          type="email"
          options={FORM_FIELD_VALIDATION.EMAIL}
          required
          Input={AuthFormTextField}
          label={email}
          disabled={isLoading}
        />
        <FormInput
          autoComplete="current-password"
          id="password"
          name="password"
          type="password"
          required
          Input={AuthFormTextField}
          label={password}
          disabled={isLoading}
        />
        {forgotPasswordLink && (
          <ForgotPasswordText as={RouterLink} to={forgotPasswordLink}>
            {forgotPassword}
          </ForgotPasswordText>
        )}
        <AuthSubmitButton type="submit" isLoading={isLoading}>
          {login}
        </AuthSubmitButton>
        {showRegisterLink && (
          <AuthLink>
            {dontHaveAnAccount}
            {RegisterLinkComponent || <RouterLink to={registerLink}>{register}</RouterLink>}
          </AuthLink>
        )}
      </StyledForm>
    </Wrapper>
  );
};
