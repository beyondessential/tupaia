/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import Typography from '@material-ui/core/Typography';
import { AuthViewWrapper } from './AuthViewWrapper';
import { AuthViewButton } from './AuthViewButton';
import { HookForm, HookFormInput } from '../HookForm';
import { Checkbox, TextField } from '../../components';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { RouterLink } from '../RouterLink';
import { SignupComplete } from './SignUpComplete';

const Wrapper = styled(AuthViewWrapper)`
  width: 49rem;
`;

const LinkText = styled(Typography)`
  font-weight: 400;
  font-size: 0.6875rem;
  line-height: 1.4;

  ${AuthViewButton} + & {
    margin-top: 1.3rem;
  }
`;

const TermsText = styled.span`
  color: ${props => props.theme.palette.text.primary};

  a {
    color: ${props => props.theme.palette.text.primary};
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

const StyledForm = styled(HookForm)`
  margin-top: 1rem;
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
}: RegisterFormProps) => {
  return (
    <Wrapper
      title={isSuccess ? 'Your account has been registered' : 'Register'}
      subtitle={!isSuccess ? 'Enter your details below to create an account' : undefined}
    >
      {isSuccess ? (
        <SignupComplete successMessage={successMessage} verifyResendLink={verifyResendLink} />
      ) : (
        <>
          {error && <Typography color="error">{error.message}</Typography>}
          <StyledForm formContext={formContext} onSubmit={onSubmit as SubmitHandler<any>}>
            <HookFormInput name="firstName" label="First name" required Input={TextField} />
            <HookFormInput name="lastName" label="Last name" required Input={TextField} />
            <HookFormInput
              name="emailAddress"
              label="Email"
              type="email"
              required
              options={FORM_FIELD_VALIDATION.EMAIL}
              Input={TextField}
            />
            <HookFormInput
              name="contactNumber"
              label="Contact number (optional)"
              Input={TextField}
            />
            <HookFormInput
              name="password"
              label="Password"
              type="password"
              required
              options={FORM_FIELD_VALIDATION.PASSWORD}
              Input={TextField}
            />
            <HookFormInput
              name="passwordConfirm"
              label="Confirm password"
              type="password"
              required
              options={{
                validate: (value: string) =>
                  value === formContext.getValues('password') || 'Passwords do not match.',
                ...FORM_FIELD_VALIDATION.PASSWORD,
              }}
              Input={TextField}
            />
            <HookFormInput name="employer" label="Employer" required Input={TextField} />
            <HookFormInput name="position" label="Position" required Input={TextField} />
            <FullWidthColumn>
              <HookFormInput
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
                Input={Checkbox}
              />
            </FullWidthColumn>
            <ButtonColumn>
              <AuthViewButton type="submit" isLoading={isLoading}>
                Register account
              </AuthViewButton>
              <LinkText align="center">
                Already have an account? <RouterLink to={loginLink}>Log in here</RouterLink>
              </LinkText>
            </ButtonColumn>
          </StyledForm>
        </>
      )}
    </Wrapper>
  );
};
