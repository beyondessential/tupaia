/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {
  respond,
  ValidationError,
  ObjectValidator,
  constructRecordExistsWithId,
} from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { resourceToRecordType } from '../utilities';
import {
  editAccessRequest,
  editUserAccount,
  editOption,
  editOptionSet,
  editSurvey,
  editSurveyScreenComponent,
} from '../dataAccessors';

const EDITABLE_RECORD_TYPES = [
  TYPES.USER_ACCOUNT,
  TYPES.SURVEY_RESPONSE,
  TYPES.SURVEY,
  TYPES.SURVEY_SCREEN_COMPONENT,
  TYPES.USER_ENTITY_PERMISSION,
  TYPES.ANSWER,
  TYPES.QUESTION,
  TYPES.FEED_ITEM,
  TYPES.OPTION_SET,
  TYPES.OPTION,
  TYPES.DATA_SOURCE,
  TYPES.COMMENT,
  TYPES.ACCESS_REQUEST,
  TYPES.DASHBOARD_REPORT,
  TYPES.MAP_OVERLAY,
  TYPES.DASHBOARD_GROUP,
  TYPES.PROJECT,
];

const CUSTOM_RECORD_UPDATERS = {
  [TYPES.USER_ACCOUNT]: editUserAccount,
  [TYPES.OPTION_SET]: editOptionSet,
  [TYPES.OPTION]: editOption,
  [TYPES.SURVEY]: editSurvey,
  [TYPES.SURVEY_SCREEN_COMPONENT]: editSurveyScreenComponent,
  [TYPES.ACCESS_REQUEST]: editAccessRequest,
};

// TODO remove when this task is done https://github.com/beyondessential/tupaia-backlog/issues/723
const SKIP_ID_VALIDATION = [TYPES.DASHBOARD_REPORT, TYPES.MAP_OVERLAY, TYPES.DASHBOARD_GROUP];

/**
 * Responds to PUT requests by editing a record
 */
export async function editRecord(req, res) {
  const { database, params, body: updatedFields, models } = req;
  const { resource, id } = params;
  const recordType = resourceToRecordType(resource);

  // Validate that the record matches required format
  if (!EDITABLE_RECORD_TYPES.includes(recordType)) {
    throw new ValidationError(`${resource} is not a valid PUT endpoint`);
  }

  // TODO remove when this task is done https://github.com/beyondessential/tupaia-backlog/issues/723
  const validationCriteria = SKIP_ID_VALIDATION.includes(recordType)
    ? {}
    : {
        id: [constructRecordExistsWithId(database, recordType)],
      };

  const validator = new ObjectValidator(validationCriteria);
  await validator.validate({ id }); // Will throw an error if not valid

  // Update the record, using a custom updater if necessary
  if (CUSTOM_RECORD_UPDATERS[recordType]) {
    await CUSTOM_RECORD_UPDATERS[recordType](models, id, updatedFields, req);
  } else {
    await models.getModelForDatabaseType(recordType).updateById(id, updatedFields);
  }
  respond(res, { message: `Successfully updated ${resource}` });
}
