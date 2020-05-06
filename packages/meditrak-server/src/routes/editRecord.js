/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { respond, ValidationError } from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { ObjectValidator, constructRecordExistsWithId } from '../validation';
import { resourceToRecordType } from '../utilities';
import {
  editUserAccount,
  editOption,
  editOptionSet,
  editSurveyScreenComponent,
} from '../dataAccessors';

const EDITABLE_RECORD_TYPES = [
  TYPES.USER_ACCOUNT,
  TYPES.SURVEY_RESPONSE,
  TYPES.SURVEY,
  TYPES.SURVEY_SCREEN_COMPONENT,
  TYPES.USER_COUNTRY_PERMISSION,
  TYPES.USER_FACILITY_PERMISSION,
  TYPES.USER_GEOGRAPHICAL_AREA_PERMISSION,
  TYPES.ANSWER,
  TYPES.QUESTION,
  TYPES.FEED_ITEM,
  TYPES.OPTION_SET,
  TYPES.OPTION,
  TYPES.DATA_SOURCE,
  TYPES.ALERT,
  TYPES.COMMENT,
];

const CUSTOM_RECORD_UPDATERS = {
  [TYPES.USER_ACCOUNT]: editUserAccount,
  [TYPES.OPTION_SET]: editOptionSet,
  [TYPES.OPTION]: editOption,
  [TYPES.SURVEY_SCREEN_COMPONENT]: editSurveyScreenComponent,
};

/**
 * Responds to PUT requests by editing a record
 **/
export async function editRecord(req, res) {
  const { database, params, body: updatedFields, models } = req;
  const { resource, id } = params;
  const recordType = resourceToRecordType(resource);

  // Validate that the record matches required format
  if (!EDITABLE_RECORD_TYPES.includes(recordType)) {
    throw new ValidationError(`${resource} is not a valid PUT endpoint`);
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
