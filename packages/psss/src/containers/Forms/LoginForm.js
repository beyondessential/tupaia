/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TextField, Button, Checkbox } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { login, checkIsPending, checkIsError, getError } from '../../store';
import * as COLORS from '../../constants/colors';
import { useFormFields } from '../../hooks';

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

const StyledButton = styled(Button)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const LoginFormComponent = ({ isPending, isError, error, onLogin }) => {
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
      <Heading component="h4">Enter your email and password</Heading>
      {isError && <ErrorMessage>{error}</ErrorMessage>}
      <TextField
        id="email"
        name="email"
        placeholder="Email"
        type="email"
        value={fields.email}
        onChange={handleFieldChange}
      />
      <TextField
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        value={fields.password}
        onChange={handleFieldChange}
      />
      <Checkbox id="rememberMe" color="primary" label="Remember me" />
      <StyledButton type="submit" fullWidth isLoading={isPending}>
        Login to your account
      </StyledButton>
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
