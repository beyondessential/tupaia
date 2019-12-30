import { getDataElementsFromCodes } from './getDataElementsFromCodes';

export const getOptionsForDataElement = async (dhisApi, dataElementCode) => {
  const dataElementsMatchingCode =
    (await getDataElementsFromCodes(dhisApi, [dataElementCode], true)) || {};
  if (Object.keys(dataElementsMatchingCode).length !== 1) {
    throw new Error(
      `Should be exactly one data element matching code ${dataElementCode}, does it exist in DHIS2?`,
    );
  }
  return dataElementsMatchingCode[dataElementCode].options;
};
