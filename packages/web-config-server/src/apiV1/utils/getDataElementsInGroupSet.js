import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { CustomError } from '/errors';

export const getDataElementsInGroupSet = async (dhisApi, groupSetCode, useCodeAsKey = false) => {
  const result = await dhisApi.getRecord({
    type: DHIS2_RESOURCE_TYPES.DATA_ELEMENT_GROUP_SET,
    code: groupSetCode,
    fields: 'name,dataElementGroups[displayName, id, code, dataElements[id, code]]',
  });
  if (result === null || !result.dataElementGroups || result.dataElementGroups.length === 0) {
    throw new CustomError({
      type: 'DHIS Communication error',
      description: 'Data element group set does not exist or has no dataElementGroups',
      dataElementGroupSets: groupSetCode,
    });
  }
  const dataElementToGroupMapping = {};
  const dataElementGroups = {};
  result.dataElementGroups.forEach(
    ({ displayName, id: dataElementGroupId, code: dataElementGroupCode, dataElements }) => {
      const dataElementGroupKey = useCodeAsKey ? dataElementGroupCode : dataElementGroupId;
      dataElementGroups[dataElementGroupKey] = { name: displayName, code: dataElementGroupCode };
      if (!dataElements) return;
      dataElements.forEach(({ id: dataElementId, code: dataElementCode }) => {
        const dataElementKey = useCodeAsKey ? dataElementCode : dataElementId;
        dataElementToGroupMapping[dataElementKey] = dataElementGroupKey;
      });
    },
  );
  return { dataElementToGroupMapping, dataElementGroups, dataElementGroupSetName: result.name };
};
/*
To and From, ids may not match this is just an example.

From:
{
  "dataElementGroups": [
    {
      "name": "General Clinical Services",
      "id": "TVMU1MzqaS2",
      "dataElements": [
        {
          "id": "q1oVcImFYwX"
        },
        {
          "id": "MijdwBt3Qq5"
        },
        {
          "id": "pMn2Xoep4nM"
        }
      ]
    },
    {
      "name": "Maternal and Family Planning",
      "id": "m0Zt8SPqXpS",
      "dataElements": [
        {
          "id": "hEztUV067Xi"
        },
        {
          "id": "hgltZxF2nd5"
        },
        {
          "id": "bjjf8x3yNWn"
        }
      ]
    },
    {
      "name": "Mental Health and Rehabilitation",
      "id": "uQp71Vj8EgE",
      "dataElements": [
        {
          "id": "roBJrxpvd9P"
        },
        {
          "id": "qNt1A1u75ee"
        },
        {
          "id": "xAry0jOJlHl"
        }
      ]
    },
  ]
}

To:
{ dataElementToGroupMapping:
   { q1oVcImFYwX: 'TVMU1MzqaS2',
     MijdwBt3Qq5: 'TVMU1MzqaS2',
     pMn2Xoep4nM: 'TVMU1MzqaS2',
     hgltZxF2nd5: 'm0Zt8SPqXpS',
     bjjf8x3yNWn: 'm0Zt8SPqXpS',
     PfmddVNlfi5: 'm0Zt8SPqXpS',
     qNt1A1u75ee: 'uQp71Vj8EgE',
     nNY5vt0aM3J: 'uQp71Vj8EgE',
     JwPIpJE7Ri1: 'uQp71Vj8EgE', },
  dataElementGroups:
   { TVMU1MzqaS2: 'General Clinical Services',
     m0Zt8SPqXpS: 'Maternal and Family Planning',
     uQp71Vj8EgE: 'Mental Health and Rehabilitation' }
    }
*/
