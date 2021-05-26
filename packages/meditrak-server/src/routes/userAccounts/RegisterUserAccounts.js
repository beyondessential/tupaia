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
import { sendVerifyEmail } from '../verifyEmail';
import { allowNoPermissions } from '../../permissions';

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
      countryCode,
      permissionGroupName,
    } = this.newRecordData;

    const { userId } = await this.createUserRecord({
      firstName,
      lastName,
      emailAddress,
      employer,
      position,
      contactNumber,
      password,
    });

    if (countryCode && permissionGroupName) {
      const country = await this.models.entity.findOne({
        code: countryCode,
        type: 'country',
      });

      const permissionGroup = await this.models.permissionGroup.findOne({
        name: permissionGroupName,
      });

      if (!permissionGroup) {
        throw new Error(`No such permission group: ${permissionGroupName}`);
      }

      if (!country) {
        throw new Error(`No such country: ${countryCode}`);
      }

      await this.models.userEntityPermission.findOrCreate({
        user_id: userId,
        entity_id: country.id,
        permission_group_id: permissionGroup.id,
      });
    }

    sendVerifyEmail(this.req, userId);

    return { userId };
  }
}
