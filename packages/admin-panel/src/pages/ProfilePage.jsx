import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import MuiDivider from '@material-ui/core/Divider';
import { Button, SmallAlert, TextField, ImageUploadField } from '@tupaia/ui-components';
import { PageHeader } from '../widgets';
import { useUser } from '../api/queries';
import { useUpdateProfile } from '../api/mutations';

const Wrapper = styled.div`
  overflow: auto;
`;

const Container = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  max-width: 26rem;
  margin: 2.5rem auto;
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

export const ProfilePage = React.memo(() => {
  const { data: user } = useUser();
  const [profileImage, setProfileImage] = useState({
    fileId: null,
    data: user?.profileImage,
  });
  const { handleSubmit, register, errors } = useForm();
  const { mutate: updateProfile, isSuccess, error, isLoading } = useUpdateProfile();

  const onSubmit = handleSubmit(data => {
    updateProfile({
      ...data,
      profile_image: profileImage,
    });
  });

  const handleFileChange = async base64 => {
    setProfileImage({
      fileId: `${user?.id}-profileImage`,
      data: base64,
    });
  };

  const handleFileDelete = () => {
    // We need to set a file id to something so that the backend will pick up the profileImage field
    // as an updatedField and save the change.
    setProfileImage({ fileId: null, data: null });
  };

  if (!user) return null;

  const { firstName, lastName, position, employer } = user;
  const userInitial = (firstName || lastName).charAt(0);

  return (
    <Wrapper>
      <Container>
        <PageHeader title={user.name} />
        <form onSubmit={onSubmit} noValidate>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
          {isSuccess && <SuccessMessage>Profile successfully updated.</SuccessMessage>}
          <ImageUploadField
            name="profile_image"
            imageSrc={profileImage && profileImage.data}
            onChange={handleFileChange}
            onDelete={handleFileDelete}
            avatarInitial={userInitial}
            label="Your avatar"
          />
          <Divider />
          <TextField
            label="First Name"
            name="first_name"
            autoComplete="given-name"
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
            name="last_name"
            autoComplete="family-name"
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
    </Wrapper>
  );
});
