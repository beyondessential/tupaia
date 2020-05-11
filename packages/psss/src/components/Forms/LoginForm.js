/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { TextField, Button } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';

const useFormFields = initialState => {
  const [fields, setValues] = useState(initialState);

  return [
    fields,
    event => {
      setValues({
        ...fields,
        [event.target.id]: event.target.value,
      });
    },
  ];
};

export const LoginForm = ({ handleLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fields, handleFieldChange] = useFormFields({
    email: '',
    password: '',
  });

  const handleSubmit = event => {
    event.preventDefault();
    setLoading(true);
    const { email, password } = fields;

    handleLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h3" component="h3" gutterBottom>
        Login
      </Typography>
      {error && (
        <div style={{ color: 'red' }}>
          <p>Oops, there was an error logging you in.</p>
          <p>
            <i>{error.message}</i>
          </p>
        </div>
      )}
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
      <Button type="submit">Sign in</Button>
    </form>
  );
};
