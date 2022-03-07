/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  FormValidationError,
  UnauthenticatedError,
  ObjectValidator,
  hasNoAlphaLetters,
  fieldHasContent,
  isEmail,
  isValidPassword,
} from '@tupaia/utils';
import { CreateUserAccounts } from './CreateUserAccounts';
import { sendEmailVerification } from '../utilities/emailVerification';
import { allowNoPermissions } from '../../permissions';

const PLATFORM_CONFIGS = {
  'lesmis-server@tupaia.org': {
    primaryPlatform: 'lesmis',
    permissionGroupName: 'LESMIS Public',
    countryName: 'Laos',
  },
};

/**
 * Handles POST endpoint for registering user:
 * - /user
 */
export class RegisterUserAccounts extends CreateUserAccounts {
  async assertUserHasAccess() {
    await this.assertPermissions(allowNoPermissions); // new registrations can be created by anyone
  }

  async validate() {
    const { emailAddress, password, passwordConfirm, contactNumber } = this.newRecordData;

    const fieldValidators = {
      firstName: [fieldHasContent],
      lastName: [fieldHasContent],
      emailAddress: [fieldHasContent, isEmail],
      password: [fieldHasContent],
      passwordConfirm: [fieldHasContent],
      contactNumber: contactNumber ? [hasNoAlphaLetters] : [],
      employer: [fieldHasContent],
      position: [fieldHasContent],
    };

    // Most errors are checked using the ObjectValidator except for a few specific ones which are easier to check here in createUser
    const createUserValidator = new ObjectValidator(fieldValidators);

    const constructError = (message, field) => new FormValidationError(message, field);
    await createUserValidator.validate(this.newRecordData, constructError);

    if (password !== passwordConfirm) {
      throw new FormValidationError('Passwords do not match.', ['password', 'passwordConfirm']);
    }

    try {
      isValidPassword(password);
    } catch (error) {
      throw new FormValidationError(error.message, ['password', 'passwordConfirm']);
    }

    const existingUsers = await this.models.user.find({
      email: { comparisonValue: emailAddress, comparator: 'ilike' },
    });
    if (existingUsers.length > 0) {
      throw new UnauthenticatedError('Existing user found with same email address.');
    }

    return true;
  }

  async createRecord() {
    const {
      firstName,
      lastName,
      emailAddress,
      employer,
      position,
      contactNumber,
      password,
    } = this.newRecordData;

    let userData = {
      firstName,
      lastName,
      emailAddress,
      employer,
      position,
      contactNumber,
      password,
    };

    // Get one of the non-default platform configs if it exists
    const email = this.req?.apiClientUser?.email;
    const platformConfig = email in PLATFORM_CONFIGS ? PLATFORM_CONFIGS[email] : null;

    if (platformConfig) {
      const { permissionGroupName, countryName, primaryPlatform } = platformConfig;
      userData = { ...userData, permissionGroupName, countryName, primaryPlatform };
    }

    const { userId } = await this.createUserRecord(userData);
    const user = await this.models.user.findById(userId);
    await sendEmailVerification(user);

    return { userId };
  }
}
