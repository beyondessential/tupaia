/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import {
  constructRecordExistsWithId,
  constructRecordExistsWithField,
  constructRecordNotExistsWithField,
  hasContent,
  isEmail,
  isBoolean,
  isAString,
  isPlainObject,
  constructIsEmptyOr,
  constructIsOneOf,
  constructIsSubSetOf,
  isValidPassword,
  isNumber,
  ValidationError,
} from '@tupaia/utils';
import { DATA_SOURCE_SERVICE_TYPES } from '../../database/models/DataElement';

export const constructForParent = (models, recordType, parentRecordType) => {
  const combinedRecordType = `${parentRecordType}/${recordType}`;
  const { SURVEY_RESPONSE, COMMENT } = TYPES;

  switch (combinedRecordType) {
    case `${SURVEY_RESPONSE}/${COMMENT}`:
      return {
        survey_response_id: [constructRecordExistsWithId(models.surveyResponse)],
        user_id: [constructRecordExistsWithId(models.user)],
        text: [hasContent],
      };
    default:
      throw new ValidationError(
        `${parentRecordType}/[${parentRecordType}Id]/${recordType} is not a valid POST endpoint`,
      );
  }
};

export const constructForSingle = (models, recordType) => {
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
        type: [isAString],
        template_variables: [constructIsEmptyOr(isPlainObject)],
      };
    case TYPES.PERMISSION_GROUP:
      return {
        name: [hasContent],
        parent_id: [constructIsEmptyOr(constructRecordExistsWithId(models.permissionGroup))],
      };
    case TYPES.DATA_ELEMENT:
    case TYPES.DATA_GROUP:
      return {
        code: [hasContent],
        service_type: [constructIsOneOf(DATA_SOURCE_SERVICE_TYPES)],
        config: [hasContent],
      };
    case TYPES.INDICATOR:
      return {
        code: [hasContent],
        builder: [hasContent],
      };
    case TYPES.REPORT:
      return {
        code: [constructRecordNotExistsWithField(models.report, 'code')],
        config: [hasContent],
        permission_group: [hasContent],
      };
    case TYPES.LEGACY_REPORT:
      return {
        code: [constructRecordNotExistsWithField(models.legacyReport, 'code')],
        data_builder: [hasContent],
        data_builder_config: [hasContent],
      };
    case TYPES.DASHBOARD:
      return {
        code: [hasContent],
        name: [hasContent],
        root_entity_code: [hasContent],
        sort_order: [constructIsEmptyOr(isNumber)],
      };
    case TYPES.DASHBOARD_RELATION:
      return {
        dashboard_id: [constructRecordExistsWithId(models.dashboard)],
        child_id: [constructRecordExistsWithId(models.dashboardItem)],
        entity_types: [constructIsSubSetOf(Object.values(models.entity.types))],
        permission_groups: [
          async permissionGroupNames => {
            const permissionGroups = await models.permissionGroup.find({
              name: permissionGroupNames,
            });
            if (permissionGroupNames.length !== permissionGroups.length) {
              throw new Error('Some provided permission groups do not exist');
            }
            return true;
          },
        ],
        project_codes: [
          async projectCodes => {
            const projects = await models.project.find({
              code: projectCodes,
            });
            if (projectCodes.length !== projects.length) {
              throw new Error('Some provided projects do not exist');
            }
            return true;
          },
        ],
        sort_order: [constructIsEmptyOr(isNumber)],
      };
    case TYPES.DASHBOARD_ITEM:
      return {
        code: [constructRecordNotExistsWithField(models.dashboardItem, 'code')],
        config: [hasContent],
        report_code: [hasContent],
        legacy: [hasContent, isBoolean],
      };
    case TYPES.MAP_OVERLAY_GROUP_RELATION:
      return {
        map_overlay_group_id: [constructRecordExistsWithId(models.mapOverlayGroup)],
        child_id: [
          async (value, { child_type: childType }) => {
            if (childType === models.mapOverlayGroupRelation.RelationChildTypes.MAP_OVERLAY) {
              // Map Overlay Id is not in UID form so this is a work around.
              await constructRecordExistsWithField(models.mapOverlay, 'id')(value);
            } else {
              await constructRecordExistsWithId(models.mapOverlayGroup)(value);
            }
          },
        ],
        child_type: [
          constructIsOneOf(Object.values(models.mapOverlayGroupRelation.RelationChildTypes)),
        ],
        sort_order: [constructIsEmptyOr(isNumber)],
      };
    case TYPES.MAP_OVERLAY:
      return {
        code: [constructRecordNotExistsWithField(models.mapOverlay, 'code')],
        name: [hasContent],
        permission_group: [constructRecordExistsWithField(models.permissionGroup, 'name')],
        config: [hasContent],
        report_code: [hasContent],
        legacy: [hasContent, isBoolean],
      };
    case TYPES.MAP_OVERLAY_GROUP:
      return {
        code: [hasContent],
        name: [hasContent],
      };
    case TYPES.DATA_SERVICE_SYNC_GROUP:
      return {
        data_group_code: [constructRecordExistsWithField(models.survey, 'code')],
        service_type: [constructIsOneOf(Object.values(models.dataServiceSyncGroup.SERVICE_TYPES))],
        config: [hasContent],
      };
    default:
      throw new ValidationError(`${recordType} is not a valid POST endpoint`);
  }
};

export const constructNewRecordValidationRules = (models, recordType, parentRecordType = null) => {
  if (parentRecordType) {
    return constructForParent(models, recordType, parentRecordType);
  }

  return constructForSingle(models, recordType);
};
