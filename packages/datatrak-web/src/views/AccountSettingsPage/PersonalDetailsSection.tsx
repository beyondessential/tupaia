/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCurrentUser } from '../../api';
import { AccountSettingsSection } from './AccountSettingsSection';
import { Button } from '../../components';
import { TextField } from '@tupaia/ui-components';

type PersonalDetails = {
  firstName: string;
  lastName: string;
  contactNumber?: string;
  employer: string;
  position: string;
};

function submitChanges(details: PersonalDetails): SubmitHandler<PersonalDetails> {
  console.log(details);
}

const SaveButton = styled(Button)`
  grid-column: -2;
`;

const StyledTextField = styled(TextField)`
  margin: 0; // Use gap on parent to control spacing
`;

const PersonalDetailsForm = styled.form`
  display: grid;
  gap: 1.56rem 1.25rem;
  max-width: 44.25rem;
  width: 100%;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template-columns: repeat(2, 1fr);
  }

  .MuiFormLabel-root {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
`;

export const PersonalDetailsSection = () => {
  const user = useCurrentUser();
  const {
    formState: { isDirty },
    handleSubmit,
    register,
  } = useForm<PersonalDetails>({
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      contactNumber: user.contactNumber ?? '',
      employer: user.employer ?? '',
      position: user.position ?? '',
    },
  });

  return (
    <AccountSettingsSection title="Personal details" description="Edit your personal details">
      <PersonalDetailsForm onSubmit={handleSubmit(submitChanges)}>
        <StyledTextField
          name="firstName"
          label="First name"
          placeholder="First name"
          autoComplete="given-name"
          defaultValue={user.firstName}
          {...register('firstName', { required: true })}
          // required
        />
        <StyledTextField
          name="lastName"
          label="Last name"
          placeholder="Last name"
          autoComplete="family-name"
          defaultValue={user.lastName}
          {...register('lastName', { required: true })}
          required
        />
        <StyledTextField
          name="email"
          label="Email"
          placeholder="Email"
          tooltip="You cannot change your email address"
          autoComplete="email"
          value={user.email}
          required
          disabled
        />
        <StyledTextField
          name="contactNumber"
          label="Contact number (optional)"
          placeholder="Contact number"
          autoComplete="tel"
          defaultValue={user.contactNumber}
          {...register('contactNumber', { required: true })}
        />
        <StyledTextField
          name="employer"
          label="Employer"
          placeholder="Employer"
          autoComplete="organization"
          defaultValue={user.employer}
          {...register('employer', { required: true })}
          required
        />
        <StyledTextField
          name="position"
          label="Position"
          placeholder="Position"
          autoComplete="organization-title"
          defaultValue={user.position}
          {...register('position', { required: true })}
          required
        />
        <SaveButton type="submit" disabled={!isDirty}>
          Save changes
        </SaveButton>
      </PersonalDetailsForm>
    </AccountSettingsSection>
  );
};
