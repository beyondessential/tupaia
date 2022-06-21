/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import semverCompare from 'semver-compare';

const appSupportedModels = {
  country: { minVersion: '0.0.1' },
  entity: { minVersion: '1.7.102', unsupportedFields: ['region', 'bounds'] },
  facility: { minVersion: '0.0.1' },
  geographicalArea: { minVersion: '0.0.23' },
  option: { minVersion: '1.7.92' },
  optionSet: { minVersion: '1.7.92' },
  permissionGroup: { minVersion: '1.7.86' },
  question: { minVersion: '0.0.1' },
  survey: { minVersion: '0.0.1' },
  surveyGroup: { minVersion: '1.6.69' },
  surveyScreen: { minVersion: '0.0.1' },
  surveyScreenComponent: { minVersion: '0.0.1' },
};

/**
 * Returns list of models supported by the appVersion
 * (all models if no appVersion specified)
 */
export const getSupportedModels = (appVersion?: string) => {
  if (!appVersion) {
    return Object.keys(appSupportedModels);
  }

  return Object.entries(appSupportedModels)
    .filter(
      ([, { minVersion: modelMinVersion }]) => semverCompare(appVersion, modelMinVersion) >= 0,
    )
    .map(([modelName]) => modelName);
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
