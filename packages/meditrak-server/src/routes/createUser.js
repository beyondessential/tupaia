/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import {
  respond,
  FormValidationError,
  UnauthenticatedError,
  ObjectValidator,
  hasNoAlphaLetters,
  fieldHasContent,
  isEmail,
  isValidPassword,
} from '@tupaia/utils';
import { createUser as createUserAccessor } from '../dataAccessors';
import { sendVerifyEmail } from './verifyEmail';
import { assertBESAdminAccess } from '../permissions';

const PERMISSION_GROUPS = {
  PUBLIC: 'Public',
  DONOR: 'Donor',
  ADMIN: 'Admin',
};

const DEMO_LAND_NAME = 'Demo Land';

export const createUser = async (req, res) => {
  await req.assertPermissions(assertBESAdminAccess);

  const { models } = req;
  const requestBody = req.body ? req.body : {};

  const {
    firstName,
    lastName,
    emailAddress,
    password,
    passwordConfirm,
    contactNumber,
    employer,
    position,
  } = requestBody;

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
  await createUserValidator.validate(requestBody, constructError);

  if (password !== passwordConfirm) {
    throw new FormValidationError('Passwords do not match.', ['password', 'passwordConfirm']);
  }

  try {
    isValidPassword(password);
  } catch (error) {
    throw new FormValidationError(error.message, ['password', 'passwordConfirm']);
  }

  const existingUsers = await models.user.find({
    email: { comparisonValue: emailAddress, comparator: 'ilike' },
  });
  if (existingUsers.length > 0) {
    throw new UnauthenticatedError('Existing user found with same email address.');
  }

  const { userId } = await createUserAccessor(models, {
    firstName,
    lastName,
    emailAddress,
    employer,
    position,
    contactNumber,
    password,
    countryName: DEMO_LAND_NAME,
    permissionGroupName: PERMISSION_GROUPS.PUBLIC,
  });

  sendVerifyEmail(req, userId);

  respond(res, { userId });
};
