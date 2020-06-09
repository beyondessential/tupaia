/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import {
  respond,
  ValidationError,
  ObjectValidator,
  constructRecordExistsWithId,
} from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { resourceToRecordType } from '../utilities';
import { editUserAccount, editOption, editOptionSet } from '../dataAccessors';

const EDITABLE_RECORD_TYPES = [
  TYPES.USER_ACCOUNT,
  TYPES.SURVEY_RESPONSE,
  TYPES.SURVEY,
  TYPES.USER_COUNTRY_PERMISSION,
  TYPES.USER_FACILITY_PERMISSION,
  TYPES.USER_GEOGRAPHICAL_AREA_PERMISSION,
  TYPES.ANSWER,
  TYPES.QUESTION,
  TYPES.FEED_ITEM,
  TYPES.OPTION_SET,
  TYPES.OPTION,
];

const CUSTOM_RECORD_UPDATERS = {
  [TYPES.USER_ACCOUNT]: editUserAccount,
  [TYPES.OPTION_SET]: editOptionSet,
  [TYPES.OPTION]: editOption,
};

/**
 * Responds to POST requests by editing a record
 **/
export async function editRecord(req, res) {
  const { database, params, body: updatedFields, models } = req;
  const { resource, id } = params;
  const recordType = resourceToRecordType(resource);

  // Validate that the record matches required format
  if (!EDITABLE_RECORD_TYPES.includes(recordType)) {
    throw new ValidationError(`${resource} is not a valid POST endpoint`);
  }
  const validator = new ObjectValidator({
    id: [constructRecordExistsWithId(database, recordType)],
  });
  await validator.validate({ id }); // Will throw an error if not valid

  // Update the record, using a custom updater if necessary
  if (CUSTOM_RECORD_UPDATERS[recordType]) {
    await CUSTOM_RECORD_UPDATERS[recordType](models, id, updatedFields);
  } else {
    await models.getModelForDatabaseType(recordType).updateById(id, updatedFields);
  }
  respond(res, { message: `Successfully updated ${resource}` });
}
