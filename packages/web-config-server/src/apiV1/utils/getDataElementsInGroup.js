import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { CustomError } from '@tupaia/utils';

export const getDataElementsInGroup = async (dhisApi, code, useCodeAsKey = false) => {
  const result = await dhisApi.getRecord({
    type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT_GROUP,
    code,
    fields: 'dataElements[id,code,name]',
  });
  if (result === null || !result.dataElements || result.dataElements.length === 0) {
    throw new CustomError({
      type: 'DHIS Communication error',
      description: 'Data element group does not exist, or has no elements',
      dataElementGroups: code,
    });
  }
  const dataElementsByKey = {};
  const keyName = useCodeAsKey ? 'code' : 'id';
  result.dataElements.forEach(({ [keyName]: key, ...restOfDataElement }) => {
    dataElementsByKey[key] = restOfDataElement;
  });
  return dataElementsByKey;
};

export const getDataElementCodesInGroup = async (dhisApi, dataElementGroupCode) => {
  const dataElements = await getDataElementsInGroup(dhisApi, dataElementGroupCode, true);
  return Object.keys(dataElements);
};
