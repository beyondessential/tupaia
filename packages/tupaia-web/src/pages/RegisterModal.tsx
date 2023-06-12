/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Checkbox } from '@tupaia/ui-components';
import { Link } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useRegister } from '../api/mutations';
import { TextField } from '../components';
import { AuthModal, ModalButton } from '../layout';

const StyledAuthModal = styled(AuthModal)`
  .MuiDialog-paper {
    width: 53rem;
  }
`;

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 1rem;
  row-gap: 0.5rem;
  margin-top: 1rem;
  width: 42rem;
  max-width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    grid-template-columns: 1fr 1fr;
    column-gap: 2rem;
    row-gap: 0;
  }
`;

const LinkText = styled(Typography)`
  font-weight: 400;
  font-size: 11px;
  line-height: 15px;
  color: white;

  a {
    color: white;
  }

  ${ModalButton} + & {
    margin-top: 1.3rem;
  }
`;

const FullWidthColumn = styled.div`
  grid-column: 1/-1;
`;

export const RegisterModal = () => {
  const { handleSubmit, register, errors } = useForm();
  const { mutate: onSubmit, isLoading, isError, error } = useRegister();

  return (
    <StyledAuthModal title="Register" subtitle="Enter your details below to create an account">
      {isError && <Typography color="error">{error.message}</Typography>}
      <StyledForm onSubmit={handleSubmit(onSubmit as SubmitHandler<any>)} noValidate>
        <TextField
          name="firstName"
          label="First name *"
          error={!!errors?.firstName}
          helperText={errors?.firstName && errors?.firstName.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="lastName"
          label="Last name *"
          error={!!errors?.lastName}
          helperText={errors?.firstNalastNameme && errors?.lastName.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="email"
          label="Email *"
          error={!!errors?.email}
          helperText={errors?.email && errors?.email.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="contactNumber"
          label="Contact number (optional)"
          error={!!errors?.contactNumber}
          helperText={errors?.contactNumber && errors?.contactNumber.message}
          inputRef={register()}
        />
        <TextField
          name="password"
          label="Password *"
          error={!!errors?.password}
          helperText={errors?.password && errors?.password.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="passwordConfirm"
          label="Confirm password *"
          error={!!errors?.passwordConfirm}
          helperText={errors?.passwordConfirm && errors?.passwordConfirm.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="employer"
          label="Employer *"
          error={!!errors?.employer}
          helperText={errors?.employer && errors?.employer.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          name="position"
          label="Position *"
          error={!!errors?.position}
          helperText={errors?.position && errors?.position.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <Checkbox
          name="terms"
          color="primary"
          label="I agree to the terms and conditions"
          error={!!errors.terms}
          helperText={errors?.terms?.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <FullWidthColumn>
          <ModalButton type="submit" isLoading={isLoading}>
            Register account
          </ModalButton>
          <LinkText align="center">
            Already have an account? <Link to="/login">Log in here</Link>
          </LinkText>
        </FullWidthColumn>
      </StyledForm>
    </StyledAuthModal>
  );
};
