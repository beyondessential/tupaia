import { ajvValidate } from '@tupaia/tsutils';
import { EntityType, SurveyScreenComponent, SurveyScreenComponentSchema } from '@tupaia/types';
import semverCompare from 'semver-compare';

export const SURVEY_SCREEN_COMPONENT_SCHEMA_CHANGE_ENTITY_UPSERT_VERSION = '1.13.129';

type SurveyScreenComponentConfigEntityFilter = {
  parentId?: {
    questionId: string;
  };
  grandParentId?: {
    questionId: string;
  };
  attributes?: {
    type: string;
  };
  type?: EntityType[];
};

type SurveyScreenComponentConfigEntityFields = {
  parentId?: {
    questionId: string;
  };
  code?: {
    questionId: string;
  };
  name?: {
    questionId: string;
  };
  type?: EntityType;
  attributes?: {
    type: string;
  };
};

/**
 * This isn't the entire survey_screen_component config schema, just what's relevant for this function
 * Adding the proper schema can happen once we convert the config field to JSONB in: RN-986
 */
type SurveyScreenComponentConfig = {
  entity?: {
    createNew?: boolean;
    generateQrCode?: boolean;
    allowScanQrCode?: boolean;
    filter?: SurveyScreenComponentConfigEntityFilter;
    fields?: SurveyScreenComponentConfigEntityFields;
  };
};

const extractEntityFields = (
  createNew?: boolean,
  fieldsConfig?: SurveyScreenComponentConfigEntityFields,
  filterConfig?: SurveyScreenComponentConfigEntityFilter,
) => {
  if (createNew) {
    // if createNew, use the fields config
    if (!fieldsConfig) return {};
    const { type, ...restOfFieldsConfig } = fieldsConfig;

    return { type: type ? [type] : undefined, ...restOfFieldsConfig };
  }

  // if not creating new, use filter
  if (!filterConfig) {
    return {};
  }

  return filterConfig;
};

/**
 * Convert updated config format:
 *
 * {
 *  createNew: true,
 *  fields: {
 *      parentId: {
 *          questionId: 12312322
 *      }
 *  }
 * }
 *
 *
 * To previous format:
 *
 * {
 *  createNew: true,
 *  parentId: {
 *      questionId: 12312322
 *  }
 * }
 *
 */
export const translateToPreEntityUpsert = (record: Record<string, unknown>) => {
  const validatedRecord = ajvValidate<SurveyScreenComponent>(SurveyScreenComponentSchema, record);
  const { config } = validatedRecord;
  const { entity: entityConfig, ...restOfConfig } = (
    config ? JSON.parse(config) : {}
  ) as SurveyScreenComponentConfig;

  if (!entityConfig) {
    // No need for translation if no entity config
    return record;
  }

  const { createNew, fields, filter, ...restOfEntityConfig } = entityConfig;

  const entityFields = extractEntityFields(createNew, fields, filter);

  const oldConfig = { ...restOfEntityConfig, createNew, ...entityFields };

  return {
    ...validatedRecord,
    config: JSON.stringify({ ...restOfConfig, entity: oldConfig }),
  } as Record<string, unknown>;
};

const translators: Record<string, (record: Record<string, unknown>) => Record<string, unknown>> = {
  [SURVEY_SCREEN_COMPONENT_SCHEMA_CHANGE_ENTITY_UPSERT_VERSION]: translateToPreEntityUpsert,
};

const getTranslator = (appVersion: string) => {
  const translatorVersion = Object.keys(translators).find(
    version => semverCompare(appVersion, version) < 0,
  );

  if (!translatorVersion) {
    return undefined;
  }

  return translators[translatorVersion];
};

export const translateRecordForSync = (appVersion: string, record: Record<string, unknown>) => {
  const translator = getTranslator(appVersion);
  if (!translator) {
    return record;
  }
  return translator(record);
};
