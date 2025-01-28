// TODO: The code in this file is to implement a hacky approach to fetch indicator values
// because the normal analytics/rawData.json endpoint does not return any data for indicators.
// Will have to implement this properly with #tupaia-backlog/issues/2412
// After that remove this file and anything related to it

export const checkAllDataElementsAreDhisIndicators = async (models, dataElementCodes) => {
  const dataElements = await models.dataElement.find({
    code: dataElementCodes,
  });

  if (dataElementCodes.length !== dataElements.length) {
    throw new Error('Could not find one of the data elements, please check each code');
  }
  for (const dataElementCode of dataElementCodes) {
    const dataElement = dataElements.find(d => d.code === dataElementCode);
    if (
      !dataElement.config.dhisId ||
      !['ProgramIndicator'].includes(dataElement.config.dhisDataType)
    ) {
      return false;
    }
  }
  return true;
};
