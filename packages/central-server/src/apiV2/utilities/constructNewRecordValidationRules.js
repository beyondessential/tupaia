import { RECORDS } from '@tupaia/database';
import {
  constructRecordExistsWithId,
  constructRecordExistsWithField,
  constructRecordNotExistsWithField,
  hasContent,
  isBoolean,
  isAString,
  isPlainObject,
  constructIsEmptyOr,
  constructIsOneOf,
  isValidPassword,
  isNumber,
  ValidationError,
  constructRecordExistsWithCode,
  constructIsValidEntityType,
  isHexColor,
  isURL,
  isURLPathSegment,
  constructIsShorterThan,
} from '@tupaia/utils';
import { DataTableType, PeriodGranularity } from '@tupaia/types';
import { DATA_SOURCE_SERVICE_TYPES } from '../../database/models/DataElement';

export const constructForParent = (models, recordType, parentRecordType) => {
  const combinedRecordType = `${parentRecordType}/${recordType}`;
  const { SURVEY_RESPONSE, COMMENT, TASK, TASK_COMMENT } = RECORDS;

  switch (combinedRecordType) {
    case `${SURVEY_RESPONSE}/${COMMENT}`:
      return {
        survey_response_id: [constructRecordExistsWithId(models.surveyResponse)],
        user_id: [constructRecordExistsWithId(models.user)],
        text: [hasContent],
      };
    case `${TASK}/${TASK_COMMENT}`:
      return {
        message: [hasContent, isAString],
        type: [constructIsOneOf(['user', 'system'])],
      };
    default:
      throw new ValidationError(
        `${parentRecordType}/[${parentRecordType}Id]/${recordType} is not a valid POST endpoint`,
      );
  }
};

export const constructForSingle = (models, recordType) => {
  switch (recordType) {
    case RECORDS.USER_ENTITY_PERMISSION:
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
    case RECORDS.COUNTRY:
      return {
        name: [hasContent],
        code: [hasContent],
      };
    case RECORDS.USER_ACCOUNT:
      return {
        first_name: [hasContent],
        last_name: [hasContent],
        email: [hasContent],
        password: [isValidPassword],
        countryName: [hasContent],
        permissionGroupName: [hasContent],
      };
    case RECORDS.FEED_ITEM:
      return {
        country_id: [constructIsEmptyOr(constructRecordExistsWithId(models.country))],
        geographical_area_id: [
          constructIsEmptyOr(constructRecordExistsWithId(models.geographicalArea)),
        ],
        user_id: [constructIsEmptyOr(constructRecordExistsWithId(models.user))],
        permission_group_id: [
          // Always require a permission group ID, by default an item should at least be public.
          constructIsEmptyOr(constructRecordExistsWithId(models.permissionGroup)),
        ],
        type: [isAString],
        template_variables: [constructIsEmptyOr(isPlainObject)],
      };
    case RECORDS.PERMISSION_GROUP:
      return {
        name: [hasContent],
        parent_id: [constructRecordExistsWithId(models.permissionGroup)],
      };
    case RECORDS.DATA_ELEMENT:
      return {
        code: [hasContent],
        service_type: [constructIsOneOf(DATA_SOURCE_SERVICE_TYPES)],
        config: [hasContent],
        permission_groups: [
          hasContent,
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
      };
    case RECORDS.DATA_GROUP:
      return {
        code: [hasContent],
        service_type: [constructIsOneOf(DATA_SOURCE_SERVICE_TYPES)],
        config: [hasContent],
      };
    case RECORDS.EXTERNAL_DATABASE_CONNECTION:
      return {
        code: [hasContent],
        name: [hasContent],
      };
    case RECORDS.INDICATOR:
      return {
        code: [hasContent],
        builder: [hasContent],
      };
    case RECORDS.REPORT:
      return {
        code: [constructRecordNotExistsWithField(models.report, 'code')],
        config: [hasContent],
        permission_group: [hasContent],
      };
    case RECORDS.LEGACY_REPORT:
      return {
        code: [constructRecordNotExistsWithField(models.legacyReport, 'code')],
        data_builder: [hasContent],
        data_builder_config: [hasContent],
      };
    case RECORDS.DASHBOARD:
      return {
        code: [hasContent],
        name: [hasContent],
        root_entity_code: [hasContent],
        sort_order: [constructIsEmptyOr(isNumber)],
      };
    case RECORDS.DASHBOARD_RELATION:
      return {
        dashboard_id: [constructRecordExistsWithId(models.dashboard)],
        child_id: [constructRecordExistsWithId(models.dashboardItem)],
        entity_types: [
          async entityTypes => {
            const entityTypeValidator = constructIsValidEntityType(models.entity);
            await Promise.all(entityTypes.map(entityTypeValidator));
          },
        ],
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
    case RECORDS.DASHBOARD_ITEM:
      return {
        code: [constructRecordNotExistsWithField(models.dashboardItem, 'code')],
        config: [hasContent],
        report_code: [hasContent],
        legacy: [hasContent, isBoolean],
      };
    case RECORDS.DASHBOARD_MAILING_LIST:
      return {
        dashboard_id: [hasContent],
        project_id: [hasContent],
        entity_id: [hasContent],
      };
    case RECORDS.DASHBOARD_MAILING_LIST_ENTRY:
      return {
        dashboard_mailing_list_id: [hasContent],
        email: [hasContent],
      };
    case RECORDS.MAP_OVERLAY_GROUP_RELATION:
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
    case RECORDS.MAP_OVERLAY:
      return {
        code: [constructRecordNotExistsWithField(models.mapOverlay, 'code')],
        name: [hasContent],
        permission_group: [constructRecordExistsWithField(models.permissionGroup, 'name')],
        config: [hasContent],
        report_code: [hasContent],
        legacy: [hasContent, isBoolean],
      };
    case RECORDS.MAP_OVERLAY_GROUP:
      return {
        code: [hasContent],
        name: [hasContent],
      };
    case RECORDS.DATA_SERVICE_SYNC_GROUP:
      return {
        data_group_code: [constructRecordExistsWithField(models.survey, 'code')],
        service_type: [constructIsOneOf(Object.values(models.dataServiceSyncGroup.SERVICE_TYPES))],
        config: [hasContent],
      };
    case RECORDS.PROJECT:
      return {
        code: [
          constructRecordNotExistsWithField(models.project, 'code'),
          isAString,
          async code => {
            if (code.trim() === '') {
              throw new Error('The code should contain words');
            }
            return true;
          },
        ],
        name: [
          isAString,
          async name => {
            if (name.trim() === '') {
              throw new Error('The name should contain words');
            }
            const entityWithName = await models.entity.findOne({
              type: 'project',
              name,
            });
            if (entityWithName) {
              throw new Error('A project already exists with this name.');
            }
            return true;
          },
        ],
        countries: [
          async countries => {
            const countryEntities = await models.country.find({
              id: countries,
            });
            if (countryEntities.length !== countries.length) {
              throw new Error('One or more provided countries do not exist');
            }
            return true;
          },
        ],
        permission_groups: [
          hasContent,
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
        description: [isAString],
        sort_order: [constructIsEmptyOr(isNumber)],
        image_url: [isAString],
        logo_url: [isAString],
        entityTypes: [
          async selectedEntityTypes => {
            if (!selectedEntityTypes) {
              return true;
            }
            const entityTypes = await models.entity.getEntityTypes();
            const filteredEntityTypes = entityTypes.filter(type =>
              selectedEntityTypes.includes(type),
            );
            if (selectedEntityTypes.length !== filteredEntityTypes.length) {
              throw new Error('Some provided entity types do not exist');
            }
            return true;
          },
        ],
        dashboard_group_name: [isAString],
        default_measure: [constructRecordExistsWithField(models.mapOverlay, 'code')],
      };
    case RECORDS.DATA_ELEMENT_DATA_SERVICE:
      return {
        data_element_code: [constructRecordExistsWithCode(models.dataElement)],
        country_code: [hasContent],
        service_type: [constructIsOneOf(DATA_SOURCE_SERVICE_TYPES)],
        service_config: [hasContent],
      };
    case RECORDS.DATA_TABLE:
      return {
        code: [isAString],
        description: [isAString],
        config: [hasContent],
        type: [constructIsOneOf(Object.values(DataTableType))],
        permission_groups: [
          hasContent,
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
      };
    case RECORDS.LANDING_PAGE:
      return {
        name: [hasContent, constructIsShorterThan(40)],
        website_url: [constructIsEmptyOr(isURL)],
        external_link: [constructIsEmptyOr(isURL)],
        primary_hexcode: [constructIsEmptyOr(isHexColor)],
        secondary_hexcode: [constructIsEmptyOr(isHexColor)],
        long_bio: [constructIsEmptyOr(constructIsShorterThan(250))],
        extended_title: [constructIsEmptyOr(constructIsShorterThan(60))],
        url_segment: [
          hasContent,
          isURLPathSegment,
          constructRecordNotExistsWithField(models.landingPage, 'url_segment'),
          urlSegment => {
            const forbiddenRoutes = [
              'login',
              'register',
              'request-access',
              'reset-password',
              'request-access',
              'verify-email',
            ];
            if (forbiddenRoutes.includes(urlSegment)) {
              throw new Error('This url segment is not allowed');
            }
            return true;
          },
        ],
        project_codes: [
          hasContent,
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
      };
    case RECORDS.SURVEY:
      return {
        'project.code': [hasContent, constructRecordExistsWithField(models.project, 'code')],
        code: [hasContent, constructRecordNotExistsWithField(models.survey, 'code')],
        name: [hasContent, isAString, constructIsShorterThan(50)],
        'permission_group.name': [
          hasContent,
          constructRecordExistsWithField(models.permissionGroup, 'name'),
        ],
        countryNames: [
          async (countryNames, { 'project.code': projectCode }) => {
            if (countryNames.length < 1) {
              throw new Error('Must specify at least one country');
            }
            const countryEntities = await models.country.find({
              name: countryNames,
            });
            if (countryEntities.length !== countryNames.length) {
              throw new Error('One or more provided countries do not exist');
            }
            const project = await models.project.findOne({
              code: projectCode,
            });

            const projectCountries = await project.countries();
            const projectCountryNames = projectCountries.map(country => country.name);
            const invalidCountries = countryNames.filter(
              countryName => !projectCountryNames.includes(countryName),
            );
            if (invalidCountries.length > 0) {
              throw new Error(
                `The following countries are not part of the project: ${invalidCountries.join(
                  ', ',
                )}`,
              );
            }
            return true;
          },
        ],
        can_repeat: [hasContent, isBoolean],
        'survey_group.name': [constructIsEmptyOr(isAString)],
        integration_metadata: [],
        period_granularity: [
          constructIsEmptyOr(constructIsOneOf(Object.values(PeriodGranularity))),
        ],
        requires_approval: [hasContent, isBoolean],
        // data_group_id -> generated at create time, needs following additional fields:
        'data_group.service_type': [constructIsOneOf(['dhis', 'tupaia'])],
        'data_group.config': [hasContent],
        // also survey questions comes in as a file
      };
    case RECORDS.DHIS_INSTANCE:
      return {
        code: [isAString],
        readonly: [hasContent, isBoolean],
        config: [hasContent],
      };
    case RECORDS.SUPERSET_INSTANCE:
      return {
        code: [isAString],
        config: [hasContent],
      };
    case RECORDS.TASK:
      return {
        entity_id: [constructRecordExistsWithId(models.entity)],
        survey_id: [constructRecordExistsWithId(models.survey)],
        assignee_id: [constructIsEmptyOr(constructRecordExistsWithId(models.user))],
        due_date: [hasContent],
        status: [hasContent],
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
