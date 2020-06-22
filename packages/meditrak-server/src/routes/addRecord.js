/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import {
  respond,
  ValidationError,
  ObjectValidator,
  constructRecordExistsWithId,
  hasContent,
  isEmail,
  isPlainObject,
  constructIsEmptyOr,
  constructIsOneOf,
  isValidPassword,
} from '@tupaia/utils';
import { TYPES } from '@tupaia/database';
import { constructNewRecordValidationRules } from './utilities';
import { resourceToRecordType } from '../utilities';
import { createUser, createJoinChild } from '../dataAccessors';
import { FEED_ITEM_TYPES } from '../database/models/FeedItem';
import { DATA_SOURCE_SERVICE_TYPES } from '../database/models/DataSource';

const { ALERT, COMMENT, USER_ACCOUNT } = TYPES;

const PARENT_RECORD_CREATORS = {
  [`${ALERT}/${COMMENT}`]: createJoinChild,
};

const CUSTOM_RECORD_CREATORS = {
  [USER_ACCOUNT]: createUser,
};

/**
 * Responds to the POST requests by adding a record
 **/
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

const constructValidationRules = (models, recordType) => {
  switch (recordType) {
    case TYPES.USER_ENTITY_PERMISSION:
      return {
        user_id: [constructRecordExistsWithId(models.user)],
        entity_id: [
          constructRecordExistsWithId(models.entity),
          async entityId => {
            const entity = await models.entity.findById(entityId);
            if (entity.type !== 'country') {
              throw new Error('Only country level permissions are currently supported');
            }
          },
        ],
        permission_group_id: [constructRecordExistsWithId(models.permissionGroup)],
      };
    case TYPES.COUNTRY:
      return {
        name: [hasContent],
        code: [hasContent],
      };
    case TYPES.USER_ACCOUNT:
      return {
        first_name: [hasContent],
        last_name: [hasContent],
        email: [hasContent, isEmail],
        password: [isValidPassword],
      };
    case TYPES.FEED_ITEM:
      return {
        country_id: [constructIsEmptyOr(constructRecordExistsWithId(models.country))],
        geographical_area_id: [
          constructIsEmptyOr(constructRecordExistsWithId(models.geographicalArea)),
        ],
        user_id: [constructIsEmptyOr(constructRecordExistsWithId(models.user))],
        permission_group_id: [
          // Always require a permission group ID, by default an item should at least be public.
          constructRecordExistsWithId(models.permissionGroup),
        ],
        type: [constructIsOneOf(FEED_ITEM_TYPES)],
        template_variables: [constructIsEmptyOr(isPlainObject)],
      };
    case TYPES.PERMISSION_GROUP:
      return {
        name: [hasContent],
        parent_id: [constructIsEmptyOr(constructRecordExistsWithId(models.permissionGroup))],
      };
    case TYPES.DATA_SOURCE:
      return {
        code: [hasContent],
        type: [hasContent],
        service_type: [constructIsOneOf(DATA_SOURCE_SERVICE_TYPES)],
        config: [hasContent],
      };
    default:
      throw new ValidationError(`${recordType} is not a valid PUT endpoint`);
  }
};
