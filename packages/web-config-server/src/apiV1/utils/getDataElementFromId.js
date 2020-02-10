import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';

export const getDataElementFromId = async (dhisApi, dataElementId) => {
  const result = await dhisApi.getRecord({
    type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT,
    id: dataElementId,
    fields: 'id,code,name,optionSet',
  });
  return result;
};
