/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import Typography from '@material-ui/core/Typography';
import { useRegister } from '../../api/mutations';
import { SignUpComplete } from './SignUpComplete';
import { SubmitHandler } from 'react-hook-form';
import {
  TextField,
  CheckboxField,
  AuthModalBody,
  AuthModalButton,
  RouterLink,
  Form,
} from '../../components';
import { FORM_FIELD_VALIDATION } from '../../constants';
import { MODAL_ROUTES } from '../../constants';

const ModalBody = styled(AuthModalBody)`
  width: 49rem;
`;

const LinkText = styled(Typography)`
  font-weight: 400;
  font-size: 0.6875rem;
  line-height: 1.4;
  color: ${props => props.theme.palette.common.white};

  a {
    color: ${props => props.theme.palette.common.white};
  }

  ${AuthModalButton} + & {
    margin-top: 1.3rem;
  }
`;

const TermsText = styled.span`
  color: ${props => props.theme.palette.common.white};

  a {
    color: ${props => props.theme.palette.common.white};
  }
`;

const FullWidthColumn = styled.div`
  grid-column: 1/-1;
`;

const StyledForm = styled(Form)`
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

export const RegisterModal = () => {
  const { mutate: onSubmit, isLoading, isError, isSuccess, error } = useRegister();
  const formContext = useForm();

  return (
    <ModalBody
      title={isSuccess ? 'Your account has been registered' : 'Register'}
      subtitle={!isSuccess ? 'Enter your details below to create an account' : undefined}
    >
      {isSuccess ? (
        <SignUpComplete />
      ) : (
        <>
          {isError && <Typography color="error">{error.message}</Typography>}
          <StyledForm formContext={formContext} onSubmit={onSubmit as SubmitHandler<any>}>
            <TextField name="firstName" label="First name" required />
            <TextField name="lastName" label="Last name" required />
            <TextField
              name="emailAddress"
              label="Email"
              type="email"
              required
              options={FORM_FIELD_VALIDATION.EMAIL}
            />
            <TextField name="contactNumber" label="Contact number (optional)" />
            <TextField
              name="password"
              label="Password"
              type="password"
              required
              options={FORM_FIELD_VALIDATION.PASSWORD}
            />
            <TextField
              name="passwordConfirm"
              label="Confirm password"
              type="password"
              required
              options={{
                validate: (value: string) =>
                  value === formContext.getValues('password') || 'Passwords do not match.',
                ...FORM_FIELD_VALIDATION.PASSWORD,
              }}
            />
            <TextField name="employer" label="Employer" required />
            <TextField name="position" label="Position" required />
            <FullWidthColumn>
              <CheckboxField
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
              />
            </FullWidthColumn>
            <FullWidthColumn>
              <AuthModalButton type="submit" isLoading={isLoading}>
                Register account
              </AuthModalButton>
              <LinkText align="center">
                Already have an account?{' '}
                <RouterLink to={MODAL_ROUTES.LOGIN}>Log in here</RouterLink>
              </LinkText>
            </FullWidthColumn>
          </StyledForm>
        </>
      )}
    </ModalBody>
  );
};
