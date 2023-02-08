/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const onProcessDataForSave = data => {
  const processedData = { ...data };
  const { config = {}, type: dataTableType } = processedData;
  if (dataTableType === 'sql') {
    const { additionalParameters = [] } = config;
    const modifiedParameters = additionalParameters.map(p => {
      const { name, type, required, hasDefaultValue, defaultValue } = p;
      return { name, config: { type, required, hasDefaultValue, defaultValue } };
    });

    processedData.config.additionalParameters = modifiedParameters;
  }

  return processedData;
};
