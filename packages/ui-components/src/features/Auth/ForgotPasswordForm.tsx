import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LinkProps } from 'react-router-dom-v6';
import styled from 'styled-components';
import { AuthSubmitButton } from './AuthSubmitButton';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { RouterLink } from '../RouterLink';
import { Form, FormInput } from '../Form';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthFormTextField } from './AuthFormTextField';
import { AuthErrorMessage } from './AuthErrorMessage';
import { AuthLink } from './AuthLink';

const Wrapper = styled(AuthViewWrapper)<{
  $isSuccess?: boolean;
}>`
  width: 36rem;
  &.MuiPaper-root.MuiPaper-rounded {
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

interface ForgotPasswordFormProps {
  isLoading: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  formContext: ReturnType<typeof useForm>;
  onSubmit: SubmitHandler<any>;
  loginLink: LinkProps['to'];
  registerLink: LinkProps['to'];
  RegisterLinkComponent?: React.ReactNode;
}

export const ForgotPasswordForm = ({
  onSubmit,
  isLoading,
  error,
  isSuccess,
  formContext,
  loginLink,
  registerLink,
  RegisterLinkComponent,
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
      {error && <AuthErrorMessage>{error.message}</AuthErrorMessage>}
      {!isSuccess && (
        <StyledForm onSubmit={onSubmit} formContext={formContext}>
          <FormInput
            Input={AuthFormTextField}
            id="emailAddress"
            name="emailAddress"
            label="Email"
            type="email"
            required
            options={FORM_FIELD_VALIDATION.EMAIL}
            disabled={isLoading}
          />
          <AuthSubmitButton type="submit" isLoading={isLoading}>
            Reset password
          </AuthSubmitButton>
          <AuthSubmitButton to={loginLink} variant="outlined" component={RouterLink}>
            Back to log in
          </AuthSubmitButton>
          <AuthLink align="center">
            Don&rsquo;t have an account?{' '}
            {RegisterLinkComponent ? (
              RegisterLinkComponent
            ) : (
              <RouterLink to={registerLink}>Sign up</RouterLink>
            )}
          </AuthLink>
        </StyledForm>
      )}
    </Wrapper>
  );
};
