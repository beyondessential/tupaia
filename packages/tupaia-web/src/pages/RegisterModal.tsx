/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useLogin } from '../api/mutations';
import { TextField } from '../components';
import { AuthModal, ModalButton } from '../layout';

const StyledForm = styled.form`
  margin-top: 1rem;
  width: 340px;
  max-width: 100%;
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

const ForgotPasswordText = styled(LinkText)`
  display: block;
  margin-top: -0.6rem;
  text-align: right;
`;

export const RegisterModal = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const { mutate: login, isLoading, isError, error } = useLogin();

  return (
    <AuthModal title="Log in" subtitle="Enter your details below to log in">
      {isError && <Typography color="error">{error.message}</Typography>}
      <StyledForm onSubmit={handleSubmit(login as SubmitHandler<any>)} noValidate>
        <TextField
          name="firstName"
          label="First name "
          required
          errors={errors}
          register={register}
        />
        <EmailField />
        <ForgotPasswordText as={Link} to="/reset-password">
          Forgot password?
        </ForgotPasswordText>
        <ModalButton type="submit" isLoading={isLoading}>
          Log in
        </ModalButton>
        <LinkText align="center">
          Don't have an account? <Link to="/register">Register here</Link>
        </LinkText>
      </StyledForm>
    </AuthModal>
  );
};
