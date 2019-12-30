/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

export const getColumnsForMeditrakApp = async model => {
  const fields = await model.fetchFieldNames();
  const { meditrakIgnorableFields } = model;
  if (!meditrakIgnorableFields) return fields;
  return fields.filter(field => !meditrakIgnorableFields.includes(field));
};
