import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { CustomError } from '/errors';

export const getDataElementsInGroup = async (dhisApi, code) => {
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
  const dataElementsById = {};
  result.dataElements.forEach(({ id, ...restOfDataElement }) => {
    dataElementsById[id] = restOfDataElement;
  });
  return dataElementsById;
};
