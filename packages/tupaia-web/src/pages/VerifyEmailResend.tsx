/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { TextField } from '../components';
import { AuthModal, ModalButton } from '../layout';
import { FORM_FIELD_VALIDATION } from '../constants';
import { useForm } from 'react-hook-form';
import { useLogin } from '../api/mutations';

const StyledAuthModal = styled(AuthModal)`
  .MuiDialog-paper {
    width: 53rem;
  }
`;
const CheckEmailMessage = styled.p`
  text-align: center;
  padding: 0 15px;
`;

const StyledForm = styled.form`
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

export const VerifyEmailResend = () => {
  const { handleSubmit, register, errors } = useForm();
  const { mutate: login, isSuccess, isLoading, isError, error } = useLogin();

  return (
    <StyledAuthModal title="Register" subtitle="Enter your details below to create an account">
      {isSuccess ? (
        <CheckEmailMessage>
          Please check your email for further instructions on how to verify your account.
        </CheckEmailMessage>
      ) : (
        <StyledForm>
          <TextField
            name="email"
            label="Email *"
            type="email"
            error={!!errors?.email}
            helperText={errors?.email && errors?.email.message}
            inputRef={register({
              required: 'Required',
              ...FORM_FIELD_VALIDATION.EMAIL,
            })}
          />
          <ModalButton type="submit">Submit</ModalButton>
        </StyledForm>
      )}
    </StyledAuthModal>
  );
};
