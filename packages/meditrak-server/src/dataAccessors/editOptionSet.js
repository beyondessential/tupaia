/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const editOptionSet = async (models, id, updatedData) => {
  const optionSet = await models.optionSet.findById(id);
  const originalData = await optionSet.getData();
  const updatedModel = { ...originalData, ...updatedData };

  return models.optionSet.updateById(id, updatedModel);
};
