/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiDivider from '@material-ui/core/Divider';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Button, TextField, SmallAlert } from '@tupaia/ui-components';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';
import { updatePassword, getUser } from '../authentication';
import { PasswordStrengthBar } from '../widgets/PasswordStrengthBar';

const Container = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  max-width: 460px;
  margin: 2.5rem auto;
  min-height: calc(100vh - 445px);
`;

const StyledButton = styled(Button)`
  margin-top: 1rem;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.palette.error.main};
`;

const SuccessMessage = styled(SmallAlert)`
  margin-top: -1rem;
  margin-bottom: 1.5rem;
`;

const Divider = styled(MuiDivider)`
  margin: 0.5rem 0 1.8rem;
`;

const ChangePasswordPageComponent = React.memo(({ user, onUpdatePassword, getHeaderEl }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, register, errors, watch } = useForm();
  const HeaderPortal = usePortalWithCallback(<Header title={user.name} />, getHeaderEl);

  const onSubmit = handleSubmit(async (data, event) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await onUpdatePassword(data);
      setIsLoading(false);
      setSuccessMessage('Password successfully updated.');
      event.target.reset();
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
    }
  });

  const password = watch('password');

  return (
    <Container>
      {HeaderPortal}
      <form onSubmit={onSubmit} noValidate>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
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
        <Divider />
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
            validate: value => value === password || 'Passwords do not match.',
          })}
        />
        <PasswordStrengthBar
          password={password}
          helperText="New password must be over 8 characters long."
          pt={1}
          pb={4}
        />
        <StyledButton type="submit" fullWidth isLoading={isLoading}>
          Save Password
        </StyledButton>
      </form>
    </Container>
  );
});

ChangePasswordPageComponent.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  onUpdatePassword: PropTypes.func.isRequired,
  user: PropTypes.PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

ChangePasswordPageComponent.defaultProps = {
  user: null,
};

const mapStateToProps = state => ({
  user: getUser(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdatePassword: payload => dispatch(updatePassword(payload)),
});

export const ChangePasswordPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangePasswordPageComponent);
