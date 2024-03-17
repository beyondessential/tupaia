/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { PersonalDetailsForm } from './PersonalDetailsForm';

export const PersonalDetailsSection = () => {
  return (
    <AccountSettingsSection title="Personal details" description="Edit your personal details">
      <PersonalDetailsForm />
    </AccountSettingsSection>
  );
};
