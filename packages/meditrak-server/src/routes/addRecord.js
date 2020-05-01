/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { respond } from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { ObjectValidator, constructValidationRules } from '../validation';
import { resourceToRecordType } from '../utilities';
import { createUser } from '../dataAccessors';

const CUSTOM_RECORD_CREATORS = {
  [TYPES.USER_ACCOUNT]: createUser,
};

//const SINGULAR_ENTIT

/**
 * Responds to the POST requests by adding a record
 **/
export async function addRecord(req, res) {
  const { database, models, params, body: recordData } = req;
  const { resource, id: resourceId, subResource } = params;

  console.log('ADD RECORD', resource, resourceId, subResource);
  const recordType = resourceToRecordType(resource);
  const subRecordType = resourceToRecordType(subResource);

  // Validate that the record matches required format
  const dataToValidate =
    subRecordType !== '' && resourceId
      ? { [`${recordType}_id`]: resourceId, ...recordData }
      : recordData;
  const validator = new ObjectValidator(
    constructValidationRules(models, recordType, subRecordType),
  );
  await validator.validate(dataToValidate, recordType, resourceId, subRecordType); // Will throw an error if not valid

  // Create the record, using a custom creator if necessary
  let customResponseDetails = {};
  if (CUSTOM_RECORD_CREATORS[recordType]) {
    customResponseDetails = await CUSTOM_RECORD_CREATORS[recordType](models, recordData);
  } else if (subRecordType !== '') {
    console.log('CREATE', subRecordType, recordData);
    await database.create(subRecordType, recordData);
  } else {
    await database.create(recordType, recordData);
  }
  respond(res, { message: `Successfully added ${resource}`, ...customResponseDetails });
}
