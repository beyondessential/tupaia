/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import MuiAvatar from '@material-ui/core/Avatar';
import MuiDivider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Fab from '@material-ui/core/Fab';
import DeleteIcon from '@material-ui/icons/Delete';
import { Button, SmallAlert, TextField, FileUploadField } from '@tupaia/ui-components';
import { usePortalWithCallback } from '../utilities';
import { Header } from '../widgets';
import { updateProfile, getUser } from '../authentication';

const Container = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  max-width: 460px;
  margin: 2.5rem auto;
  min-height: calc(100vh - 445px);
`;

const Divider = styled(MuiDivider)`
  margin: 0.5rem 0 1.8rem;
`;

const StyledButton = styled(Button)`
  margin-top: 1rem;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
`;

const Avatar = styled(MuiAvatar)`
  position: relative;
  color: white;
  background: ${props => props.theme.palette.success.main};
  font-weight: 600;
  width: 85px;
  height: 85px;
  font-size: 45px;
  margin-right: 1rem;
`;

const DeleteButton = styled(Fab)`
  position: absolute;
  right: 5px;
  bottom: 0;
  width: 30px;
  min-width: 30px;
  height: 30px;
  box-shadow: none;
  min-height: 30px;
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  color: ${props => props.theme.palette.text.secondary};

  .MuiSvgIcon-root {
    font-size: 18px;
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.palette.error.main};
`;

const SuccessMessage = styled(SmallAlert)`
  margin-top: -1rem;
  margin-bottom: 1.5rem;
`;

// add to utils
function createBase64Image(fileObject) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(fileObject);
  });
}

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

const ProfilePageComponent = React.memo(({ user, onUpdateProfile, getHeaderEl }) => {
  const [fileUpload, setFileUpload] = useState(user.profileImage);
  const [fileUploadName, setFileUploadName] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const { handleSubmit, register, errors } = useForm();
  const HeaderPortal = usePortalWithCallback(<Header title={user.name} />, getHeaderEl);

  const onSubmit = handleSubmit(async ({ firstName, lastName, role, employer }) => {
    setStatus(STATUS.LOADING);
    setErrorMessage(null);
    setSuccessMessage(null);

    let updatedFields = {
      first_name: firstName,
      last_name: lastName,
      position: role,
      employer,
    };

    if (setFileUploadName) {
      updatedFields = {
        ...updatedFields,
        profileImage: {
          fileId: fileUploadName,
          data: fileUpload,
        },
      };
    }

    try {
      await onUpdateProfile(updatedFields);
      setStatus(STATUS.SUCCESS);
      setSuccessMessage('Profile successfully updated.');
    } catch (error) {
      setStatus(STATUS.ERROR);
      setErrorMessage(error.message);
    }
  });

  const handleFileChange = async event => {
    setStatus(STATUS.DISABLED);
    const fileObject = event.target.files[0];
    const Base64 = await createBase64Image(fileObject);
    const fileName = fileObject.name.replace(/\.[^/.]+$/, '');
    setFileUpload(Base64);
    setFileUploadName(fileName);
    setStatus(STATUS.IDLE);
  };

  const handleDelete = () => {
    console.log('delete...');
    setFileUpload(null);
    setFileUploadName(null);
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
          <Box display="flex" mb={2} alignItems="center">
            <Box position="relative">
              <Avatar src={fileUpload}>{userInitial}</Avatar>
              <DeleteButton onClick={handleDelete}>
                <DeleteIcon />
              </DeleteButton>
            </Box>
            {/*<div>{fileUpload}</div>*/}
            <input type="file" name="profileImage" ref={register} onChange={handleFileChange} />
            <div>{fileUploadName}</div>
            {/*<FileUploadField name="avatarUpload" label="Your avatar" />*/}
          </Box>
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
  }),
};

ProfilePageComponent.defaultProps = {
  user: null,
};

const mapStateToProps = state => ({
  user: getUser(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdateProfile: payload => dispatch(updateProfile(payload)),
});

export const ProfilePage = connect(mapStateToProps, mapDispatchToProps)(ProfilePageComponent);
