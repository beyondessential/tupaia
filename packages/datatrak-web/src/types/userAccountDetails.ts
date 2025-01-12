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
  projectId?: Project['id'] | null;
  countryId?: Entity['id'] | null;
  deleteAccountRequested?: boolean;
};
