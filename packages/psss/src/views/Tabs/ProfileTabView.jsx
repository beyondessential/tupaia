import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useForm } from 'react-hook-form';
import MuiDivider from '@material-ui/core/Divider';
import { Button, ImageUploadField, SmallAlert, TextField } from '@tupaia/ui-components';
import { Main } from '../../components';
import { updateProfile, getCurrentUser } from '../../store';
import { createBase64Image } from '../../utils/createBase64Image';

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

const Divider = styled(MuiDivider)`
  margin: 1.8rem 0;
`;

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  DISABLED: 'disabled',
};

const ProfileTabViewComponent = React.memo(({ user, onUpdateProfile }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [profileImage, setProfileImage] = useState({
    fileId: null,
    data: user.profileImage,
  });
  const { handleSubmit, register, errors } = useForm();

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
    <Main>
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
    </Main>
  );
});

ProfileTabViewComponent.propTypes = {
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

ProfileTabViewComponent.defaultProps = {
  user: null,
};

const mapStateToProps = state => ({
  user: getCurrentUser(state),
});

const mapDispatchToProps = dispatch => ({
  onUpdateProfile: payload => dispatch(updateProfile(payload)),
});

export const ProfileTabView = connect(mapStateToProps, mapDispatchToProps)(ProfileTabViewComponent);
