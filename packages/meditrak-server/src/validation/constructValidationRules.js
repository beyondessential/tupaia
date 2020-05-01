import { TYPES } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';

import {
  constructRecordExistsWithId,
  hasContent,
  isEmail,
  isPlainObject,
  constructIsEmptyOr,
  constructIsOneOf,
  isValidPassword,
  takesDateForm,
} from './validatorFunctions';

import { FEED_ITEM_TYPES } from '../database/models/FeedItem';
import { DATA_SOURCE_SERVICE_TYPES } from '../database/models/DataSource';

export const constructValidationRules = (models, recordType) => {
  switch (recordType) {
    case TYPES.USER_COUNTRY_PERMISSION:
      return {
        user_id: [constructRecordExistsWithId(models.user)],
        country_id: [constructRecordExistsWithId(models.country)],
        permission_group_id: [constructRecordExistsWithId(models.permissionGroup)],
      };

    case TYPES.USER_FACILITY_PERMISSION:
      return {
        user_id: [constructRecordExistsWithId(models.user)],
        clinic_id: [constructRecordExistsWithId(models.facility)],
        permission_group_id: [constructRecordExistsWithId(models.permissionGroup)],
      };
    case TYPES.USER_GEOGRAPHICAL_AREA_PERMISSION:
      return {
        user_id: [constructRecordExistsWithId(models.user)],
        geographical_area_id: [constructRecordExistsWithId(models.geographicalArea)],
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
    case TYPES.ALERT:
      return {
        entity_id: [constructRecordExistsWithId(models.entity)],
        data_element_id: [constructRecordExistsWithId(models.dataSource)],
        start_time: [hasContent, takesDateForm],
      };
    default:
      throw new ValidationError(`${recordType} is not a valid POST endpoint`);
  }
};
