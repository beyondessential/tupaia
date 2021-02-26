/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import axios from 'axios';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useForm } from 'react-hook-form';
import { TextField, Button, Dialog, DialogHeader, DialogContent } from '../../src';

const ErrorMessage = styled.p`
  color: red;
`;

const Heading = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const StyledButton = styled(Button)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const OpenLoginButton = styled(Button)`
  position: absolute;
  top: 30px;
  right: 30px;
`;

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

export const LoginModal = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const { handleSubmit, register, errors } = useForm();

  const { mutate: login, isError, error, isLoading } = useMutation(
    ({ email, password }) =>
      axios.post(`${baseUrl}login`, {
        emailAddress: email,
        password,
        deviceName: window.navigator.userAgent,
      }),
    {
      onSuccess: () => {
        setOpen(false);
      },
    },
  );

  return (
    <>
      <Dialog onClose={handleClose} open={open}>
        <DialogHeader title="Login" onClose={handleClose} />
        <DialogContent>
          <form onSubmit={handleSubmit(login)} noValidate>
            <Heading component="h4">Enter your email and password</Heading>
            {isError && <ErrorMessage>{error.message}</ErrorMessage>}
            <TextField
              name="email"
              placeholder="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email && errors.email.message}
              inputRef={register({
                required: 'Required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'invalid email address',
                },
              })}
            />
            <TextField
              name="password"
              type="password"
              placeholder="Password"
              error={!!errors.password}
              helperText={errors.password && errors.password.message}
              inputRef={register({
                required: 'Required',
              })}
            />
            <StyledButton type="submit" fullWidth isLoading={isLoading}>
              Login to your account
            </StyledButton>
          </form>
        </DialogContent>
      </Dialog>
      <OpenLoginButton onClick={handleOpen}>Login</OpenLoginButton>
    </>
  );
};
