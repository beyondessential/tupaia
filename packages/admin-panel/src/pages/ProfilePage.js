/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
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

export const ProfilePageComponent = ({
  user,
  errorMessage,
  isLoading,
  onUpdateProfile,
  getHeaderEl,
}) => {
  const HeaderPortal = usePortalWithCallback(<Header title="Profile" />, getHeaderEl);
  const { id, firstName, lastName, position, employer } = user;

  const handleSubmit = event => {
    event.preventDefault();
    const fields = event.target.elements;
    onUpdateProfile(id, {
      first_name: fields.firstName.value,
      last_name: fields.lastName.value,
      position: fields.role.value,
      employer: fields.employer.value,
    });
  };

  return (
    <>
      {HeaderPortal}
      <Container>
        <form onSubmit={handleSubmit} noValidate>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <TextField label="First Name" name="firstName" defaultValue={firstName} />
          <TextField label="Last Name" name="lastName" defaultValue={lastName} />
          <TextField label="Employer" name="employer" defaultValue={employer} />
          <TextField label="Role" name="role" defaultValue={position} />
          <StyledButton type="submit" fullWidth isLoading={isLoading}>
            Update Profile
          </StyledButton>
        </form>
      </Container>
    </>
  );
};

ProfilePageComponent.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  onUpdateProfile: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  user: PropTypes.PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    employer: PropTypes.string,
    position: PropTypes.string,
  }),
};

ProfilePageComponent.defaultProps = {
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

export const ProfilePage = connect(mapStateToProps, mapDispatchToProps)(ProfilePageComponent);
