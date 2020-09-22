/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

function getMeditrakConfig(model) {
  const { meditrakConfig = {} } = model;
  return meditrakConfig;
}

// Remove null entries to save bandwidth
async function removeNulls(record) {
  const recordWithoutNulls = {};
  Object.entries(record).forEach(([key, value]) => {
    if (value !== null) {
      recordWithoutNulls[key] = value;
    }
  });
  return recordWithoutNulls;
}

const STANDARD_TRANSFORMATIONS = [removeNulls];

async function processRecordForMeditrakApp(model, record) {
  const { transformations: customTransformations = [] } = getMeditrakConfig(model);
  const transformations = [...STANDARD_TRANSFORMATIONS, ...customTransformations];
  return transformations.reduce(async (prevTransformPromise, transform) => {
    const semiProcessedRecord = await prevTransformPromise;
    return transform(semiProcessedRecord, model);
  }, record);
}

/**
 * Gets the record ready to sync down to a sync client, transforming any properties as required
 **/
async function fetchColumnsForModel(model) {
  const fields = await model.fetchFieldNames();
  const { ignorableFields = [] } = getMeditrakConfig(model);
  return fields.filter(field => !ignorableFields.includes(field));
}

export const getRecordForMeditrakApp = async (model, recordId) => {
  const columns = await fetchColumnsForModel(model);
  const record = await model.findById(recordId, { columns });
  const recordData = await record.getData();
  return processRecordForMeditrakApp(model, recordData);
};
