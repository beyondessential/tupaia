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
  getProfileErrorMessage,
  getProfileLoading,
  updateProfile,
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

const ChangePasswordPageComponent = ({ user, errorMessage, isLoading, getHeaderEl }) => {
  const { handleSubmit, register, errors } = useForm();
  const HeaderPortal = usePortalWithCallback(<Header title={user.name} />, getHeaderEl);

  const onSubmit = data => {
    console.log('data', data);
  };

  return (
    <Container>
      {HeaderPortal}
      <form onSubmit={onSubmit} noValidate>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        <TextField
          label="Current Password"
          name="currentPassword"
          placeholder="Enter your current password"
          required
          error={!!errors.currentPassword}
          helperText={errors.currentPassword && errors.currentPassword.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label="New Password"
          name="newPassword"
          placeholder="Enter your password"
          required
          error={!!errors.newPassword}
          helperText={errors.newPassword && errors.newPassword.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Enter your password"
          required
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword && errors.confirmPassword.message}
          inputRef={register({
            required: 'Required',
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
  errorMessage: getProfileErrorMessage(state),
  isLoading: getProfileLoading(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdateProfile: (id, payload) => dispatch(updateProfile(id, payload)),
});

export const ChangePasswordPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChangePasswordPageComponent);
