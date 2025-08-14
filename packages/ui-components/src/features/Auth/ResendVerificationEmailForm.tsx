import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthSubmitButton } from './AuthSubmitButton';
import { Form, FormInput } from '../Form';
import { AuthFormTextField } from './AuthFormTextField';

const Wrapper = styled(AuthViewWrapper)`
  width: 53rem;
`;

const CheckEmailMessage = styled.p`
  text-align: center;
  padding: 0 0.9375rem;
`;

const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 21rem;
  max-width: 100%;
`;

interface ResendVerificationEmailFormProps {
  onSubmit: SubmitHandler<any>;
  formContext: ReturnType<typeof useForm>;
  isLoading: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  className?: string;
}
export const ResendVerificationEmailForm = ({
  onSubmit,
  formContext,
  isSuccess,
  isLoading,
  error,
  className,
}: ResendVerificationEmailFormProps) => {
  return (
    <Wrapper
      title="Resend verification email"
      subtitle={isSuccess ? '' : 'Enter your email below to resend verification email'}
      className={className}
    >
      {error && <Typography color="error">{error.message}</Typography>}
      {isSuccess ? (
        <CheckEmailMessage>
          Please check your email for further instructions on how to verify your account.
        </CheckEmailMessage>
      ) : (
        <StyledForm onSubmit={onSubmit} formContext={formContext}>
          <FormInput
            id="email"
            name="email"
            label="Email"
            type="email"
            required
            options={FORM_FIELD_VALIDATION.EMAIL}
            Input={AuthFormTextField}
          />
          <AuthSubmitButton type="submit" isLoading={isLoading}>
            Resend verification email
          </AuthSubmitButton>
        </StyledForm>
      )}
    </Wrapper>
  );
};
