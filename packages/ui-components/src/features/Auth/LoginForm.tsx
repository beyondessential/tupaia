/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LinkProps } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { AuthModalBody, AuthModalButton } from './AuthModalBody';
import { AuthFormTextField } from './AuthFormTextField';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { RouterLink } from '../RouterLink';
import { HookFormInput, HookForm } from '../HookForm';
import { EmailVerificationDisplay, STATUS } from './EmailVerificationDisplay';

const ModalBody = styled(AuthModalBody)`
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

  ${AuthModalButton} + & {
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
  logoUrl?: string;
  verificationStatus?: STATUS;
}

export const LoginForm = ({
  onSubmit,
  isLoading,
  error,
  forgotPasswordLink,
  registerLink,
  logoUrl,
  verificationStatus,
}: LoginFormProps) => {
  const formContext = useForm();

  return (
    <ModalBody title="Log in" subtitle="Enter your details below to log in" logoUrl={logoUrl}>
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
        <AuthModalButton type="submit" isLoading={isLoading}>
          Log in
        </AuthModalButton>
        <LinkText align="center">
          Don't have an account? <RouterLink to={registerLink}>Register here</RouterLink>
        </LinkText>
      </StyledForm>
    </ModalBody>
  );
};
