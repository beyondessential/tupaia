/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const getColumnsForMeditrakApp = async model => {
  const fields = await model.fetchFieldNames();
  const { meditrakConfig = {} } = model;
  const { ignorableFields = [] } = meditrakConfig;
  return fields.filter(field => !ignorableFields.includes(field));
};
