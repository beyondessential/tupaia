import React from 'react';
import { TextField, Button, Checkbox } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { login, getCurrentUser, checkIsLoading, checkIsError, getError } from '../../store';
import * as COLORS from '../../constants/colors';

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

const LoginFormComponent = ({ user, onLogin, isLoading, isError, error }) => {
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = handleSubmit(async ({ email, password, rememberMe }) => {
    window.localStorage.setItem('PSSS:rememberMe', rememberMe.toString());
    await onLogin({ email, password });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Heading component="h4">Enter your email and password</Heading>
      {isError && <ErrorMessage>{error}</ErrorMessage>}
      <TextField
        name="email"
        placeholder="Email"
        type="email"
        defaultValue={user?.email}
        error={!!errors.email}
        helperText={errors.email && errors.email.message}
        inputRef={register({
          required: 'Required',
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
      <Checkbox
        name="rememberMe"
        color="primary"
        label="Remember me"
        inputRef={register}
        defaultValue={false}
      />
      <StyledButton type="submit" fullWidth isLoading={isLoading}>
        Login to your account
      </StyledButton>
    </form>
  );
};

LoginFormComponent.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.string,
  isLoading: PropTypes.bool,
  isError: PropTypes.bool,
  user: PropTypes.PropTypes.shape({
    email: PropTypes.string,
  }),
};

LoginFormComponent.defaultProps = {
  error: null,
  isLoading: false,
  isError: false,
  user: null,
};

const mapStateToProps = state => ({
  user: getCurrentUser(state),
  isLoading: checkIsLoading(state),
  isError: checkIsError(state),
  error: getError(state),
});

const mapDispatchToProps = dispatch => ({
  onLogin: ({ email, password }) => dispatch(login({ email, password })),
});

export const LoginForm = connect(mapStateToProps, mapDispatchToProps)(LoginFormComponent);
