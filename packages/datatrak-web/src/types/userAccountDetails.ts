/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Project } from '@tupaia/types';
import { Entity } from '.';

/**
 * DTO type which carries the subset of attribute values from the `user_account` relation that are
 * used in the Account Settings section.
 */
export type UserAccountDetails = {
  firstName?: string;
  lastName?: string;
  employer?: string;
  position?: string;
  mobileNumber?: string | null;

  // Preferences
  projectId?: Project['id'];
  countryId?: Entity['id'];
  deleteAccountRequested?: boolean;
};
