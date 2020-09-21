/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Button, TextField } from '@tupaia/ui-components';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';
import {
  getPasswordErrorMessage,
  getPasswordLoading,
  updatePassword,
  getUser,
} from '../authentication';

const Container = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  max-width: 460px;
  margin: 3rem auto;
`;

const StyledButton = styled(Button)`
  margin-top: 1rem;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.palette.error.main};
`;

const ChangePasswordPageComponent = ({
  user,
  errorMessage,
  isLoading,
  onUpdatePassword,
  getHeaderEl,
}) => {
  const { handleSubmit, register, getValues, errors } = useForm();
  const HeaderPortal = usePortalWithCallback(<Header title={user.name} />, getHeaderEl);
  console.log('errors', errors);

  return (
    <Container>
      {HeaderPortal}
      <form
        onSubmit={handleSubmit(data => {
          onUpdatePassword(data);
        })}
        noValidate
      >
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <TextField
          label="Current Password"
          name="oldPassword"
          placeholder="Enter your current password"
          required
          type="password"
          error={!!errors.oldPassword}
          helperText={errors.oldPassword && errors.oldPassword.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label="New Password"
          name="password"
          placeholder="Enter your password"
          required
          type="password"
          error={!!errors.password}
          helperText={errors.password && errors.password.message}
          inputRef={register({
            required: 'Required',
            minLength: { value: 9, message: 'Password must be over 8 characters long.' },
          })}
        />
        <TextField
          label="Confirm Password"
          name="passwordConfirm"
          placeholder="Enter your password"
          required
          type="password"
          error={!!errors.passwordConfirm}
          helperText={errors.passwordConfirm && errors.passwordConfirm.message}
          inputRef={register({
            required: 'Required',
            minLength: { value: 9, message: 'Password must be over 8 characters long.' },
            validate: value => value === getValues('password') || 'Passwords do not match.',
          })}
        />
        <StyledButton type="submit" fullWidth isLoading={isLoading}>
          Save Password
        </StyledButton>
      </form>
    </Container>
  );
};

ChangePasswordPageComponent.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  onUpdatePassword: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  user: PropTypes.PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

ChangePasswordPageComponent.defaultProps = {
  errorMessage: null,
  user: null,
  isLoading: false,
};

const mapStateToProps = state => ({
  user: getUser(state),
  errorMessage: getPasswordErrorMessage(state),
  isLoading: getPasswordLoading(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdatePassword: payload => dispatch(updatePassword(payload)),
});

export const ChangePasswordPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangePasswordPageComponent);
