/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthSubmitButton } from './AuthSubmitButton';
import { Form, FormInput } from '../Form';
import { Checkbox } from '../../components';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { RouterLink } from '../RouterLink';
import { SignUpComplete } from './SignUpComplete';
import { AuthFormTextField } from './AuthFormTextField';
import { AuthLink } from './AuthLink';
import { AuthErrorMessage } from './AuthErrorMessage';

const Wrapper = styled(AuthViewWrapper)`
  width: 49rem;
`;

const TermsText = styled.span`
  color: ${props => props.theme.palette.text.primary};

  .MuiTypography-root.MuiFormControlLabel-label & a {
    color: ${props => props.theme.palette.text.primary};
    font-size: inherit; // override any font-size set elsewhere
  }
`;

const FullWidthColumn = styled.div`
  grid-column: 1/-1;
`;

const ButtonColumn = styled(FullWidthColumn)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StyledForm = styled(Form)`
  margin-top: 4.3rem;
  width: 42rem;
  max-width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 2rem;
    row-gap: 0;
  }
`;

interface RegisterFormProps {
  onSubmit: SubmitHandler<any>;
  isLoading: boolean;
  isSuccess?: boolean;
  error?: Error | null;
  formContext: ReturnType<typeof useForm>;
  loginLink: string;
  successMessage: string;
  verifyResendLink: string;
  className?: string;
}

export const RegisterForm = ({
  onSubmit,
  isLoading,
  isSuccess,
  error,
  formContext,
  loginLink,
  successMessage,
  verifyResendLink,
  className,
}: RegisterFormProps) => {
  return (
    <Wrapper
      title={isSuccess ? 'Your account has been registered' : 'Register an account'}
      subtitle={!isSuccess ? 'Enter your details below to register an account' : undefined}
      className={className}
    >
      {isSuccess ? (
        <SignUpComplete successMessage={successMessage} verifyResendLink={verifyResendLink} />
      ) : (
        <>
          {error && <AuthErrorMessage>{error.message}</AuthErrorMessage>}
          <StyledForm formContext={formContext} onSubmit={onSubmit as SubmitHandler<any>}>
            <FormInput name="firstName" label="First name" required Input={AuthFormTextField} />
            <FormInput name="lastName" label="Last name" required Input={AuthFormTextField} />
            <FormInput
              name="emailAddress"
              label="Email"
              type="email"
              required
              options={FORM_FIELD_VALIDATION.EMAIL}
              Input={AuthFormTextField}
            />
            <FormInput
              name="contactNumber"
              label="Contact number (optional)"
              Input={AuthFormTextField}
            />
            <FormInput
              name="password"
              label="Password"
              type="password"
              required
              options={FORM_FIELD_VALIDATION.PASSWORD}
              Input={AuthFormTextField}
            />
            <FormInput
              name="passwordConfirm"
              label="Confirm password"
              type="password"
              required
              options={{
                validate: (value: string) =>
                  value === formContext.getValues('password') || 'Passwords do not match.',
                ...FORM_FIELD_VALIDATION.PASSWORD,
              }}
              Input={AuthFormTextField}
            />
            <FormInput name="employer" label="Employer" required Input={AuthFormTextField} />
            <FormInput name="position" label="Position" required Input={AuthFormTextField} />
            <FullWidthColumn>
              <FormInput
                name="hasAgreed"
                label={
                  <TermsText>
                    I agree to the{' '}
                    <a
                      href="https://www.bes.au/terms-and-conditions"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      terms and conditions
                    </a>
                  </TermsText>
                }
                required
                color="primary"
                Input={Checkbox}
              />
            </FullWidthColumn>
            <ButtonColumn>
              <AuthSubmitButton type="submit" isLoading={isLoading}>
                Register account
              </AuthSubmitButton>
              <AuthLink>
                Already have an account? <RouterLink to={loginLink}>Log in here</RouterLink>
              </AuthLink>
            </ButtonColumn>
          </StyledForm>
        </>
      )}
    </Wrapper>
  );
};
