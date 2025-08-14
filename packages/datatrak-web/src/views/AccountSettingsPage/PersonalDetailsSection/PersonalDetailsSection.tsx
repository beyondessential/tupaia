import React from 'react';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { PersonalDetailsForm } from './PersonalDetailsForm';

export const PersonalDetailsSection = () => {
  return (
    <AccountSettingsSection heading="Personal details" description="Edit your personal details">
      <PersonalDetailsForm />
    </AccountSettingsSection>
  );
};
