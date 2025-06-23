import React from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Checkbox } from '../../components';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { Form, FormInput } from '../Form';
import { RouterLink } from '../RouterLink';
import { AuthErrorMessage } from './AuthErrorMessage';
import { AuthFormTextField } from './AuthFormTextField';
import { AuthLink } from './AuthLink';
import { AuthSubmitButton } from './AuthSubmitButton';
import { AuthViewWrapper } from './AuthViewWrapper';
import { SignUpComplete } from './SignUpComplete';

const Wrapper = styled(AuthViewWrapper)`
  width: 49rem;
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

const StyledForm = styled(Form<RegisterFormFields>)`
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

const TermsText = styled.span`
  color: ${({ theme }) => theme.palette.text.primary};

  .MuiTypography-root.MuiFormControlLabel-label & a {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: inherit; // override any font-size set elsewhere
  }
`;
const termsAndConditionsLabel = (
  <TermsText>
    I agree to the{' '}
    <a href="https://www.bes.au/terms-and-conditions" target="_blank" rel="noreferrer noopener">
      terms and conditions
    </a>
  </TermsText>
);

interface RegisterFormFields {
  firstName: string;
  lastName: string;
  emailAddress: string;
  contactNumber?: string | null;
  password: string;
  passwordConfirm: string;
  employer: string;
  position: string;
  hasAgreed: boolean;
}

interface RegisterFormProps {
  onSubmit: SubmitHandler<any>;
  isLoading: boolean;
  isSuccess?: boolean;
  error?: Error | null;
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
  loginLink,
  successMessage,
  verifyResendLink,
  className,
}: RegisterFormProps) => {
  const formContext = useForm<RegisterFormFields>({ mode: 'onBlur' });
  const { getValues, trigger: triggerValidationOf } = formContext;

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
          <StyledForm
            formContext={formContext}
            onSubmit={onSubmit as SubmitHandler<RegisterFormFields>}
          >
            <FormInput
              autocomplete="given-name"
              id="firstName"
              name="firstName"
              label="First name"
              required
              Input={AuthFormTextField}
            />
            <FormInput
              autocomplete="family-name"
              id="lastName"
              name="lastName"
              label="Last name"
              required
              Input={AuthFormTextField}
            />
            <FormInput
              autocomplete="email"
              id="emailAddress"
              name="emailAddress"
              label="Email"
              type="email"
              required
              options={FORM_FIELD_VALIDATION.EMAIL}
              Input={AuthFormTextField}
            />
            <FormInput
              autocomplete="tel"
              id="contactNumber"
              name="contactNumber"
              label="Contact number (optional)"
              Input={AuthFormTextField}
            />
            <FormInput
              autocomplete="new-password"
              id="password"
              name="password"
              label="Password"
              type="password"
              required
              options={FORM_FIELD_VALIDATION.PASSWORD}
              Input={AuthFormTextField}
            />
            <FormInput
              autocomplete="new-password"
              id="passwordConfirm"
              name="passwordConfirm"
              label="Confirm password"
              type="password"
              required
              options={{
                validate: (value: string) =>
                  value === getValues('password') || 'Passwords do not match',
                ...FORM_FIELD_VALIDATION.PASSWORD,
              }}
              Input={AuthFormTextField}
            />
            <FormInput
              autocomplete="organization"
              id="employer"
              name="employer"
              label="Employer"
              required
              Input={AuthFormTextField}
            />
            <FormInput
              autocomplete="organization-title"
              id="position"
              name="position"
              label="Position"
              required
              Input={AuthFormTextField}
            />
            <FullWidthColumn>
              <FormInput
                id="hasAgreed"
                name="hasAgreed"
                label={termsAndConditionsLabel}
                required
                color="primary"
                Input={Checkbox}
                type="checkbox"
                onClick={
                  /*
                   * Don’t wait for blur event on this checkbox to revalidate the form, otherwise
                   * thesubmit button doesn’t “know” to enable itself until user clicks somewhere
                   * other than this element
                   */
                  () => triggerValidationOf('hasAgreed')
                }
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
