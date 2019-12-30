/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const editOption = async (models, id, updatedData) => {
  const option = await models.option.findById(id);
  const originalData = await option.getData();
  const updatedModel = { ...originalData, ...updatedData };
  // empty string gets coalesced into undefined somewhere,
  // we want to be able to nullfiy the label field.
  if (updatedModel.label === '') updatedModel.label = null;

  return models.option.updateById(id, updatedModel);
};
