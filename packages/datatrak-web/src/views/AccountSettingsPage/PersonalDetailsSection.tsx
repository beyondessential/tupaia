/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
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

const ButtonWrapper = styled.div`
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
    control,
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
        <Controller
          control={control}
          name="firstName"
          as={
            <StyledTextField
              label="First name"
              placeholder="First name"
              autoComplete="given-name"
              defaultValue={user.firstName}
              inputProps={{ enterKeyHint: 'next' }}
              {...register('firstName', { required: true })}
              required
            />
          }
        />
        <Controller
          control={control}
          name="lastName"
          as={
            <StyledTextField
              label="Last name"
              placeholder="Last name"
              autoComplete="family-name"
              defaultValue={user.lastName}
              inputProps={{ enterKeyHint: 'next' }}
              {...register('lastName', { required: true })}
              required
            />
          }
        />
        <StyledTextField
          name="email"
          label="Email"
          placeholder="Email"
          title="You cannot change your email address"
          autoComplete="email"
          value={user.email}
          required
          disabled
        />
        <Controller
          control={control}
          name="contactNumber"
          as={
            <StyledTextField
              label="Contact number (optional)"
              placeholder="Contact number"
              autoComplete="tel"
              defaultValue={user.contactNumber}
              inputProps={{ enterKeyHint: 'next', inputMode: 'tel' }}
              {...register('contactNumber', { required: true })}
            />
          }
        />
        <Controller
          control={control}
          name="employer"
          as={
            <StyledTextField
              label="Employer"
              placeholder="Employer"
              autoComplete="organization"
              defaultValue={user.employer}
              inputProps={{ enterKeyHint: 'next' }}
              {...register('employer', { required: true })}
              required
            />
          }
        />
        <Controller
          control={control}
          name="position"
          as={
            <StyledTextField
              label="Position"
              placeholder="Position"
              autoComplete="organization-title"
              defaultValue={user.position}
              inputProps={{ enterKeyHint: 'done' }}
              {...register('position', { required: true })}
              required
            />
          }
        />
        <ButtonWrapper>
          {/* Wrapper needed to apply grid-column because tooltip attribute on <Button> wraps it in a flexbox */}
          <Button
            type="submit"
            tooltip={isDirty ? null : 'Change details to save changes'}
            disabled={!isDirty}
            fullWidth
          >
            Save changes
          </Button>
        </ButtonWrapper>
      </PersonalDetailsForm>
    </AccountSettingsSection>
  );
};
