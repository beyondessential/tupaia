/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const assertEntityPermissions = async (accessPolicy, models, entityId) => {
  const entity = await models.entity.findById(entityId);
  if (!entity) {
    throw new Error(`No entity exists with id ${entityId}`);
  }
  if (!accessPolicy.allows(entity.country_code)) {
    throw new Error('You do not have permissions for this entity');
  }
  return true;
};
