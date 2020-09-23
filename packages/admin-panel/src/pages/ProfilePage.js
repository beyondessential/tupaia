/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Button, SmallAlert, TextField } from '@tupaia/ui-components';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';
import { updateProfile, getUser } from '../authentication';

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

const SuccessMessage = styled(SmallAlert)`
  margin-top: -1rem;
  margin-bottom: 1.5rem;
`;

const ProfilePageComponent = React.memo(({ user, onUpdateProfile, getHeaderEl }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit, register, errors } = useForm();
  const HeaderPortal = usePortalWithCallback(<Header title={user.name} />, getHeaderEl);

  const onSubmit = handleSubmit(async ({ firstName, lastName, role, employer }) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onUpdateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        position: role,
        employer: employer,
      });
      setIsLoading(false);
      setSuccessMessage('Profile successfully updated.');
    } catch (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  });

  const { firstName, lastName, position, employer } = user;

  return (
    <>
      {HeaderPortal}
      <Container>
        <form onSubmit={onSubmit} noValidate>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
          <TextField
            label="First Name"
            name="firstName"
            required
            error={!!errors.firstName}
            helperText={errors.firstName && errors.firstName.message}
            defaultValue={firstName}
            inputRef={register({
              required: 'Required',
            })}
          />
          <TextField
            label="Last Name"
            name="lastName"
            required
            error={!!errors.lastName}
            helperText={errors.lastName && errors.lastName.message}
            defaultValue={lastName}
            inputRef={register({
              required: 'Required',
            })}
          />
          <TextField
            label="Employer"
            name="employer"
            required
            error={!!errors.employer}
            helperText={errors.employer && errors.employer.message}
            defaultValue={employer}
            inputRef={register({
              required: 'Required',
            })}
          />
          <TextField
            label="Role"
            name="role"
            required
            error={!!errors.role}
            helperText={errors.role && errors.role.message}
            defaultValue={position}
            inputRef={register({
              required: 'Required',
            })}
          />
          <StyledButton type="submit" fullWidth isLoading={isLoading}>
            Update Profile
          </StyledButton>
        </form>
      </Container>
    </>
  );
});

ProfilePageComponent.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  onUpdateProfile: PropTypes.func.isRequired,
  user: PropTypes.PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    employer: PropTypes.string,
    position: PropTypes.string,
  }),
};

ProfilePageComponent.defaultProps = {
  user: null,
};

const mapStateToProps = state => ({
  user: getUser(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdateProfile: (id, payload) => dispatch(updateProfile(id, payload)),
});

export const ProfilePage = connect(mapStateToProps, mapDispatchToProps)(ProfilePageComponent);
