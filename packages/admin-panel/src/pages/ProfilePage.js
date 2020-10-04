/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import MuiDivider from '@material-ui/core/Divider';
import { Button, SmallAlert, TextField, ProfileImageField } from '@tupaia/ui-components';
import { usePortalWithCallback } from '../utilities';
import { Header, ConfirmDeleteModal } from '../widgets';
import { createBase64Image } from '../utilities/createBase64Image';
import { updateProfile, getUser } from '../authentication';

const Container = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  max-width: 460px;
  margin: 2.5rem auto;
  min-height: calc(100vh - 445px);
`;

const Divider = styled(MuiDivider)`
  margin: 1.8rem 0;
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

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

const initialState = {
  status: STATUS.IDLE,
  errorMessage: null,
  successMessage: null,
  confirmModalIsOpen: false,
  profileImage: {
    fileId: null,
    data: null,
  },
};

const initReducer = user => {
  return { ...initialState, profileImage: { data: user.profileImage, fileId: null } };
};

function reducer(state, action) {
  switch (action.type) {
    case 'loading': {
      return {
        ...state,
        status: STATUS.LOADING,
        errorMessage: null,
        successMessage: null,
      };
    }
    case 'fileChange': {
      return {
        ...state,
        profileImage: action.payload,
        status: STATUS.IDLE,
      };
    }
    case 'deleteProfile': {
      return { ...state, profileImage: { fileId: '-', data: null }, confirmModalIsOpen: false };
    }
    case 'disable':
      return { ...state, status: STATUS.DISABLED };
    case 'success':
      return { ...state, status: STATUS.SUCCESS, successMessage: action.payload };
    case 'error':
      return { ...state, status: STATUS.ERROR, errorMessage: action.payload };
    case 'toggleModal':
      return { ...state, confirmModalIsOpen: action.payload };
    default:
      throw new Error('type does not exist');
  }
}

const ProfilePageComponent = React.memo(({ user, onUpdateProfile, getHeaderEl }) => {
  const { handleSubmit, register, errors } = useForm();
  const HeaderPortal = usePortalWithCallback(<Header title={user.name} />, getHeaderEl);
  const [
    { status, successMessage, errorMessage, profileImage, confirmModalIsOpen },
    dispatch,
  ] = React.useReducer(reducer, user, initReducer);

  const onSubmit = handleSubmit(async ({ firstName, lastName, role, employer }) => {
    dispatch({ type: 'loading' });
    try {
      await onUpdateProfile({
        first_name: firstName,
        last_name: lastName,
        position: role,
        employer,
        profileImage: profileImage.fileId && profileImage,
      });
      dispatch({ type: 'success', payload: 'Profile successfully updated.' });
    } catch (error) {
      dispatch({ type: 'error', payload: error.message });
    }
  });

  const handleFileChange = async event => {
    dispatch({ type: 'disable' });
    const fileObject = event.target.files[0];
    const Base64 = await createBase64Image(fileObject);
    const fileName = fileObject.name.replace(/\.[^/.]+$/, '');
    dispatch({
      type: 'fileChange',
      payload: {
        fileId: `${user.id}-${fileName}`,
        data: Base64,
      },
    });
  };

  const { firstName, lastName, position, employer } = user;
  const userInitial = user.name.substring(0, 1);

  return (
    <>
      {HeaderPortal}
      <Container>
        <form onSubmit={onSubmit} noValidate>
          {status === STATUS.ERROR && <ErrorMessage>{errorMessage}</ErrorMessage>}
          {status === STATUS.SUCCESS && <SuccessMessage>{successMessage}</SuccessMessage>}
          <ProfileImageField
            name="profileImage"
            profileImage={profileImage && profileImage.data}
            userInitial={userInitial}
            onChange={handleFileChange}
            onDelete={() => dispatch({ type: 'toggleModal', payload: true })}
          />
          <Divider />
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
          <StyledButton
            type="submit"
            fullWidth
            isLoading={status === STATUS.LOADING}
            disabled={status === STATUS.DISABLED}
          >
            Update Profile
          </StyledButton>
        </form>
        <ConfirmDeleteModal
          isOpen={confirmModalIsOpen}
          title="Remove Photo"
          message="Are you sure you want to remove your photo?"
          onConfirm={() => {
            dispatch({ type: 'deleteProfile' });
          }}
          onCancel={() => dispatch({ type: 'toggleModal', payload: false })}
        />
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
    profileImage: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = state => ({
  user: getUser(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdateProfile: payload => dispatch(updateProfile(payload)),
});

export const ProfilePage = connect(mapStateToProps, mapDispatchToProps)(ProfilePageComponent);
