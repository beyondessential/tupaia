/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useCurrentUser } from '../../api';
import { AccountSettingsSection } from './AccountSettingsSection';
import { Button } from '../../components';
import { TextField } from '@tupaia/ui-components';

const ActionButton = styled(Button)`
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
  const [firstNameValue, setFirstNameValue] = useState(user.firstName ?? '');
  const [lastNameValue, setLastNameValue] = useState(user.lastName ?? '');
  const [contactNumberValue, setContactNumberValue] = useState(user.contactNumber ?? '');
  const [employerValue, setEmployerValue] = useState(user.employer ?? '');
  const [positionValue, setPositionValue] = useState(user.position ?? '');
  const [buttonIsDisabled, setButtonDisabled] = useState(true);

  function detailsHaveChanged(): boolean {
    return (
      firstNameValue.trim() === (user.firstName ?? '') &&
      lastNameValue.trim() === (user.lastName ?? '') &&
      contactNumberValue.trim() === (user.contactNumber ?? '') &&
      employerValue.trim() === (user.employer ?? '') &&
      positionValue.trim() === (user.position ?? '')
    );
  }

  function updateSaveButtonInteractability(): void {
    setButtonDisabled(!detailsHaveChanged);
  }

  return (
    <AccountSettingsSection title="Personal details" description="Edit your personal details">
      <PersonalDetailsForm>
        <StyledTextField
          name="firstName"
          label="First name"
          placeholder="First name"
          autoComplete="given-name"
          value={firstNameValue}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => {
            setFirstNameValue(e.target.value);
            updateSaveButtonInteractability();
          }}
          required
        />
        <StyledTextField
          name="lastName"
          label="Last name"
          placeholder="Last name"
          autoComplete="family-name"
          value={lastNameValue}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => {
            setLastNameValue(e.target.value);
            updateSaveButtonInteractability();
          }}
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
          value={contactNumberValue}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => {
            setContactNumberValue(e.target.value);
            updateSaveButtonInteractability();
          }}
        />
        <StyledTextField
          name="employer"
          label="Employer"
          placeholder="Employer"
          autoComplete="organization"
          value={employerValue}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => {
            setEmployerValue(e.target.value);
            updateSaveButtonInteractability();
          }}
          required
        />
        <StyledTextField
          name="position"
          label="Position"
          placeholder="Position"
          autoComplete="organization-title"
          value={positionValue}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => {
            setPositionValue(e.target.value);
            updateSaveButtonInteractability();
          }}
          required
        />
        <ActionButton disabled={buttonIsDisabled}>Save changes</ActionButton>
      </PersonalDetailsForm>
    </AccountSettingsSection>
  );
};
