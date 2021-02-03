/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { respond, ObjectValidator } from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { constructNewRecordValidationRules } from './utilities';
import { resourceToRecordType } from '../utilities';
import { createUser, createJoinChild } from '../dataAccessors';

const { SURVEY_RESPONSE, COMMENT, USER_ACCOUNT } = TYPES;

const PARENT_RECORD_CREATORS = {
  [`${SURVEY_RESPONSE}/${COMMENT}`]: createJoinChild,
};

const CUSTOM_RECORD_CREATORS = {
  [USER_ACCOUNT]: createUser,
};

/**
 * Responds to the POST requests by adding a record
 */
export async function addRecord(req, res) {
  const { database, models, params, body: recordData } = req;
  const { parentResource, parentRecordId, resource } = params;

  const recordType = resourceToRecordType(resource);
  const parentRecordType = resourceToRecordType(parentResource);

  // Validate that the record matches required format
  const dataToValidate =
    parentRecordType !== '' && parentRecordId
      ? { [`${parentRecordType}_id`]: parentRecordId, ...recordData }
      : recordData;

  const validator = new ObjectValidator(
    constructNewRecordValidationRules(models, recordType, parentRecordType),
  );
  await validator.validate(dataToValidate); // Will throw an error if not valid

  // Create the record, using a custom creator if necessary
  let customResponseDetails = {};
  if (parentRecordType !== '') {
    const recordCreator = PARENT_RECORD_CREATORS[`${parentRecordType}/${recordType}`];
    await recordCreator(models, recordType, recordData, parentRecordType, parentRecordId);
  } else if (CUSTOM_RECORD_CREATORS[recordType]) {
    customResponseDetails = await CUSTOM_RECORD_CREATORS[recordType](models, recordData);
  } else {
    await database.create(recordType, recordData);
  }
  respond(res, { message: `Successfully added ${resource}`, ...customResponseDetails });
}
