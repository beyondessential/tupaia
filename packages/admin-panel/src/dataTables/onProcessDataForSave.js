/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const onProcessDataForSave = data => {
  const processedData = { ...data };

  if (processedData.config) {
    const { config: dataTableConfig } = processedData;

    const { additionalParams = [] } = dataTableConfig;
    // Remove other configs
    const modifiedParameters = additionalParams.map(({ name, config }) => {
      return { name, config };
    });

    processedData.config.additionalParams = modifiedParameters;
  }

  return processedData;
};
