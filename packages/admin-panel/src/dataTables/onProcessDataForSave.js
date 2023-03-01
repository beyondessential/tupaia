/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const onProcessDataForSave = data => {
  const processedData = { ...data };
  const { config: dataTableConfig } = processedData;

  const { additionalParameters = [] } = dataTableConfig;
  // Remove other configs
  const modifiedParameters = additionalParameters.map(({ name, config }) => {
    return { name, config };
  });

  processedData.config.additionalParameters = modifiedParameters;

  return processedData;
};
