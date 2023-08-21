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
import { HookFormInput, HookForm } from '../HookForm';
import { EmailVerificationDisplay, STATUS } from './EmailVerificationDisplay';
import { AuthViewButton } from './AuthViewButton';

const Wrapper = styled(AuthViewWrapper)`
  width: 38rem;
`;

const StyledForm = styled(HookForm)`
  margin-top: 1rem;
  width: 22rem;
  max-width: 100%;
`;

const LinkText = styled(Typography)`
  font-weight: 400;
  font-size: 11px;
  line-height: 15px;
  color: ${({ theme }) => theme.palette.text.primary};

  a {
    color: ${({ theme }) => theme.palette.text.primary};
  }

  ${AuthViewButton} + & {
    margin-top: 1.3rem;
  }
`;

const ForgotPasswordText = styled(LinkText)`
  margin-top: -0.4rem;
  float: right;
`;

type To = LinkProps['to'];

interface LoginFormProps {
  onSubmit: SubmitHandler<any>;
  isLoading?: boolean;
  error?: Error;
  forgotPasswordLink: To;
  registerLink: To;
  verificationStatus?: STATUS;
  formContext: ReturnType<typeof useForm>;
}

export const LoginForm = ({
  onSubmit,
  isLoading,
  error,
  forgotPasswordLink,
  registerLink,
  verificationStatus,
  formContext,
}: LoginFormProps) => {
  return (
    <Wrapper title="Log in" subtitle="Enter your details below to log in">
      {error && <Typography color="error">{error.message}</Typography>}
      {verificationStatus && <EmailVerificationDisplay status={verificationStatus} />}
      <StyledForm onSubmit={onSubmit} formContext={formContext}>
        <HookFormInput
          name="email"
          type="email"
          options={FORM_FIELD_VALIDATION.EMAIL}
          required
          Input={AuthFormTextField}
          label="Email"
          disabled={isLoading}
        />
        <HookFormInput
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
        <AuthViewButton type="submit" isLoading={isLoading}>
          Log in
        </AuthViewButton>
        <LinkText align="center">
          Don't have an account? <RouterLink to={registerLink}>Register here</RouterLink>
        </LinkText>
      </StyledForm>
    </Wrapper>
  );
};
