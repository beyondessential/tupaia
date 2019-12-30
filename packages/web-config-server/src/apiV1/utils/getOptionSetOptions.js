import { CustomError } from '/errors';

export const getOptionSetOptions = async (dhisApi, { code, id }) => {
  const result = await dhisApi.getRecord({
    type: 'optionSets',
    code,
    id,
    fields: 'options[code,name]',
  });
  if (result === null || !result.options || result.options.length === 0) {
    throw new CustomError({
      type: 'DHIS Communication error',
      description: 'Option set does not exist or has no options',
      dataElementGroups: code,
    });
  }
  const returnJson = {};
  result.options.forEach(({ name, code: optionCode }) => {
    returnJson[optionCode] = name.trim();
  });
  return returnJson;
};

/*
From:
{
  "optionSets": [
    {
      "options": [
        {
          "code": "0",
          "name": "White"
        },
        {
          "code": "1",
          "name": " Green"
        },
        {
          "code": "2",
          "name": " Orange"
        },
        {
          "code": "3",
          "name": " Red"
        }
      ]
    }
  ]
}

To:
{ '0': 'White', '1': 'Green', '2': 'Orange', '3': 'Red' }
*/
