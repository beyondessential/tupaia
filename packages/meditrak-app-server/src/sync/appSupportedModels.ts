/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { MeditrakAppServerModelRegistry } from '../types';
import { translateSurveyScreenComponentForSync } from './syncRecordTranslators';

const appSupportedModels = {
  country: {},
  entity: {
    unsupportedFields: ['region', 'bounds'],
  },
  facility: {},
  geographicalArea: {},
  option: {},
  optionSet: {},
  permissionGroup: {},
  question: {},
  survey: {},
  surveyGroup: {},
  surveyScreen: {},
  surveyScreenComponent: {
    translateRecordForSync: translateSurveyScreenComponentForSync,
  },
};

/**
 * Returns list of models supported by the appVersion
 * (all models if no appVersion specified)
 */
export const getSupportedModels = () => {
  return Object.keys(appSupportedModels) as (keyof typeof appSupportedModels)[];
};

export const getSupportedDatabaseTypes = (models: MeditrakAppServerModelRegistry) => {
  const supportedModels = getSupportedModels();
  return supportedModels.map(modelName => models[modelName].databaseType as string);
};

const isSupportedModel = (modelName: string): modelName is keyof typeof appSupportedModels =>
  Object.keys(appSupportedModels).includes(modelName);

export const getUnsupportedModelFields = (modelName: string) => {
  if (!isSupportedModel(modelName)) {
    throw new Error(`Model ${modelName} is not supported by meditrak`);
  }

  const modelConfig = appSupportedModels[modelName];
  if ('unsupportedFields' in modelConfig) {
    return modelConfig.unsupportedFields;
  }

  return [];
};

export const getSyncRecordTranslator = (modelName: string) => {
  if (!isSupportedModel(modelName)) {
    throw new Error(`Model ${modelName} is not supported by meditrak`);
  }

  const modelConfig = appSupportedModels[modelName];
  if ('translateRecordForSync' in modelConfig) {
    return modelConfig.translateRecordForSync;
  }

  return undefined;
};
