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
import { getErrorMessage, updateProfile, getUser } from '../authentication';

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

export const ProfilePageComponent = ({ user, errorMessage, onUpdateProfile, getHeaderEl }) => {
  const HeaderPortal = usePortalWithCallback(<Header title="Profile" />, getHeaderEl);
  const { firstName, lastName, position, employer } = user;
  console.log('user', user);
  return (
    <>
      {HeaderPortal}
      <Container>
        <form onSubmit={onUpdateProfile} noValidate>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <TextField label="First Name" name="firstName" defaultValue={firstName} />
          <TextField label="Last Name" name="lastName" defaultValue={lastName} />
          <TextField label="Employer" name="employer" defaultValue={employer} />
          <TextField label="Role" name="role" defaultValue={position} />
          <StyledButton type="submit" fullWidth>
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
  user: PropTypes.PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    employer: PropTypes.string,
    position: PropTypes.string,
  }),
};

ProfilePageComponent.defaultProps = {
  errorMessage: null,
  user: null,
};

const mapStateToProps = state => ({
  user: getUser(state),
  errorMessage: getErrorMessage(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdateProfile: () => dispatch(updateProfile()),
});

export const ProfilePage = connect(mapStateToProps, mapDispatchToProps)(ProfilePageComponent);
