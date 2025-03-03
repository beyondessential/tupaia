import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { CustomError } from '@tupaia/utils';

export const getDataElementGroupSets = async (dhisApi, groupSetCodes, useCodeAsKey = false) => {
  const results = await dhisApi.getRecords({
    type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT_GROUP_SET,
    codes: groupSetCodes,
    fields: 'code,name,dataElementGroups[displayName, id, code, dataElements[id, code]]',
  });
  if (results === null || results.length === 0) {
    throw new CustomError({
      type: 'DHIS Communication error',
      description: 'Data element group sets do not exist',
      dataElementGroupSets: groupSetCodes,
    });
  }

  const dataElementGroupSets = {};
  results.forEach(({ code, name, dataElementGroups: dataElementGroupList }) => {
    const dataElementToGroupMapping = {};
    const dataElementGroups = {};
    dataElementGroupList.forEach(
      ({ displayName, id: dataElementGroupId, code: dataElementGroupCode, dataElements }) => {
        const dataElementGroupKey = useCodeAsKey ? dataElementGroupCode : dataElementGroupId;
        dataElementGroups[dataElementGroupKey] = {
          name: displayName,
          code: dataElementGroupCode,
          dataElements,
        };
        if (!dataElements) return;
        dataElements.forEach(({ id: dataElementId, code: dataElementCode }) => {
          const dataElementKey = useCodeAsKey ? dataElementCode : dataElementId;
          dataElementToGroupMapping[dataElementKey] = dataElementGroupKey;
        });
      },
    );
    dataElementGroupSets[code] = {
      name,
      code,
      dataElementGroups,
      dataElementToGroupMapping,
    };
  });
  return dataElementGroupSets;
};
