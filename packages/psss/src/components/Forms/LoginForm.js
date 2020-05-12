/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TextField, Button } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';
import { FakeStore } from '../../FakeStore';
import * as COLORS from '../../theme/colors';
import { useFormFields, useAuthState } from '../../hooks';

export const ErrorMessage = styled.p`
  color: ${COLORS.RED};
`;

export const LoginForm = () => {
  const history = useHistory();
  const { isPending, isError, error } = useAuthState();

  const [fields, handleFieldChange] = useFormFields({
    email: '',
    password: '',
  });

  const handleSubmit = async event => {
    event.preventDefault();
    const { email, password } = fields;

    const { status } = await FakeStore.auth.authenticate({ email, password });
    if (status === 'success') {
      history.push('/');
    }

    if (status === 'error') {
      history.push('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h3" component="h3" gutterBottom>
        Login
      </Typography>
      {isError && <ErrorMessage>{error}</ErrorMessage>}
      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        value={fields.email}
        onChange={handleFieldChange}
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        value={fields.password}
        onChange={handleFieldChange}
      />
      <Button type="submit" isSubmitting={isPending}>
        Sign in
      </Button>
    </form>
  );
};
