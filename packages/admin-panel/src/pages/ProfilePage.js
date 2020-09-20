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
  getFirstName,
  getLastName,
  getRole,
  getEmployer,
  getErrorMessage,
  updateProfile,
  changeProfileField,
} from '../profile';

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
  firstName,
  lastName,
  employer,
  role,
  getHeaderEl,
  onChangeFirstName,
  onChangeLastName,
  onChangeEmployer,
  onChangeRole,
  errorMessage,
  onUpdateProfile,
}) => {
  const HeaderPortal = usePortalWithCallback(<Header title="Profile" />, getHeaderEl);
  return (
    <>
      {HeaderPortal}
      <Container>
        <form onSubmit={onUpdateProfile} noValidate>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <TextField
            label="First   Name"
            name="firstName"
            value={firstName}
            onChange={onChangeFirstName}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={lastName}
            onChange={onChangeLastName}
          />
          <TextField
            label="Employer"
            name="employer"
            value={employer}
            onChange={onChangeEmployer}
          />
          <TextField label="Role" name="role" value={role} onChange={onChangeRole} />
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
  onChangeFirstName: PropTypes.func.isRequired,
  onChangeLastName: PropTypes.func.isRequired,
  onChangeEmployer: PropTypes.func.isRequired,
  onChangeRole: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  employer: PropTypes.string,
  role: PropTypes.string,
};

ProfilePageComponent.defaultProps = {
  errorMessage: null,
  firstName: null,
  lastName: null,
  employer: null,
  role: null,
};

const mapStateToProps = state => ({
  firstName: getFirstName(state),
  lastName: getLastName(state),
  employer: getEmployer(state),
  role: getRole(state),
  errorMessage: getErrorMessage(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdateProfile: () => dispatch(updateProfile()),
  onChangeFirstName: () => dispatch(changeProfileField()),
  onChangeLastName: () => dispatch(changeProfileField()),
  onChangeEmployer: () => dispatch(changeProfileField()),
  onChangeRole: () => dispatch(changeProfileField()),
});

export const ProfilePage = connect(mapStateToProps, mapDispatchToProps)(ProfilePageComponent);
