export const getDataElementFromId = async (dhisApi, dataElementId) => {
  const result = await dhisApi.getRecord({
    type: 'dataElements',
    id: dataElementId,
    fields: 'id,code,name,optionSet',
  });
  return result;
};
