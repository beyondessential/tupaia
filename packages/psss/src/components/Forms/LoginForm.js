/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TextField, Button } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { login, checkIsPending, checkIsError, getError } from '../../store';
import * as COLORS from '../../theme/colors';
import { useFormFields } from '../../hooks';

export const ErrorMessage = styled.p`
  color: ${COLORS.RED};
`;

export const LoginFormComponent = ({ isPending, isError, error, onLogin }) => {
  const [fields, handleFieldChange] = useFormFields({
    email: '',
    password: '',
  });

  const handleSubmit = async event => {
    event.preventDefault();
    const { email, password } = fields;
    onLogin({ email, password });
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

LoginFormComponent.propTypes = {
  isError: PropTypes.any.isRequired,
  isPending: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onLogin: PropTypes.func.isRequired,
};

LoginFormComponent.defaultProps = {
  error: null,
};

const mapStateToProps = state => ({
  isPending: checkIsPending(state),
  isError: checkIsError(state),
  error: getError(state),
});

const mapDispatchToProps = dispatch => ({
  onLogin: ({ email, password }) => dispatch(login(email, password)),
});

export const LoginForm = connect(mapStateToProps, mapDispatchToProps)(LoginFormComponent);
