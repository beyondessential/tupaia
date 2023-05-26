/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import MuiDivider from '@material-ui/core/Divider';
import { Button, SmallAlert, TextField, ImageUploadField } from '@tupaia/ui-components';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';
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

const ProfilePageComponent = React.memo(({ user, onUpdateProfile, getHeaderEl }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [profileImage, setProfileImage] = useState({
    fileId: null,
    data: user.profileImage,
  });
  const { handleSubmit, register, errors } = useForm();
  const HeaderPortal = usePortalWithCallback(<Header title={user.name} />, getHeaderEl);

  const onSubmit = handleSubmit(async ({ firstName, lastName, role, employer }) => {
    setStatus(STATUS.LOADING);
    setErrorMessage(null);
    try {
      await onUpdateProfile({
        first_name: firstName,
        last_name: lastName,
        position: role,
        employer,
        profile_image: profileImage.data !== user.profileImage && profileImage,
      });
      setStatus(STATUS.SUCCESS);
      setSuccessMessage('Profile successfully updated.');
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  });

  const handleFileChange = async fileObject => {
    setStatus(STATUS.DISABLED);
    const base64 = await createBase64Image(fileObject);
    const fileName = fileObject.name.replace(/\.[^/.]+$/, '');
    setProfileImage({
      fileId: `${user.id}-${fileName}`,
      data: base64,
    });
    setStatus(STATUS.IDLE);
  };

  const handleFileDelete = () => {
    // We need to set a file id to something so that the backend will pick up the profileImage field
    // as an updatedField and save the change.
    setProfileImage({ fileId: null, data: null });
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
          <ImageUploadField
            name="profileImage"
            imageSrc={profileImage && profileImage.data}
            onChange={handleFileChange}
            onDelete={handleFileDelete}
            avatarInitial={userInitial}
            label="Your avatar"
            deleteModal={{
              title: 'Remove Photo',
              message: 'Are you sure you want to delete your photo?',
            }}
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
