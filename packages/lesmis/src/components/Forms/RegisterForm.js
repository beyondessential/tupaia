/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { TextField, Button } from '@tupaia/ui-components';
import styled from 'styled-components';
import MuiFormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import { useForm } from 'react-hook-form';
import * as COLORS from '../../constants';
import { useRegister } from '../../api';

const ErrorMessage = styled.p`
  color: ${COLORS.RED};
`;

const Heading = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const FieldSet = styled(MuiFormGroup)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 1.25rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  padding-bottom: 1rem;
  margin-bottom: 2rem;
`;

const StyledButton = styled(Button)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

export const RegisterForm = () => {
  const { handleSubmit, register, errors } = useForm();
  const { mutate, isError, isLoading, error } = useRegister();

  return (
    <form onSubmit={handleSubmit(fields => mutate(fields))} noValidate>
      <Heading variant="h4">Register for an account</Heading>
      {isError && <ErrorMessage>{error.message}</ErrorMessage>}
      <FieldSet>
        <TextField
          label="First Name"
          name="firstName"
          type="text"
          error={!!errors.firstName}
          helperText={errors.firstName && errors.firstName.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label="Last Name"
          name="lastName"
          type="text"
          error={!!errors.lastName}
          helperText={errors.lastName && errors.lastName.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label="Email address"
          name="emailAddress"
          type="email"
          error={!!errors.emailAddress}
          helperText={errors.emailAddress && errors.emailAddress.message}
          inputRef={register({
            required: 'Required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'invalid email address',
            },
          })}
        />
        <TextField
          label="Contact Number"
          name="contactNumber"
          type="text"
          error={!!errors.contactNumber}
          helperText={errors.contactNumber && errors.contactNumber.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label="Employer"
          name="employer"
          type="text"
          error={!!errors.employer}
          helperText={errors.employer && errors.employer.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label="Position"
          name="position"
          type="text"
          error={!!errors.position}
          helperText={errors.position && errors.position.message}
          inputRef={register({
            required: 'Required',
          })}
        />
      </FieldSet>
      <TextField
        label="Password *"
        name="password"
        type="password"
        error={!!errors.password}
        helperText={errors.password && errors.password.message}
        inputRef={register({
          required: 'Required',
        })}
      />
      <TextField
        label="Confirm Password *"
        name="passwordConfirm"
        type="password"
        error={!!errors.passwordConfirm}
        helperText={errors.passwordConfirm && errors.passwordConfirm.message}
        inputRef={register({
          required: 'Required',
        })}
      />
      <StyledButton type="submit" fullWidth isLoading={isLoading}>
        Register account now
      </StyledButton>
    </form>
  );
};
