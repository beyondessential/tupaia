/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';

export const editAccessRequest = async (models, id, updatedFields, { userId }) => {
  const { approved } = await models.accessRequest.findOne({ id });
  if (approved !== null) {
    throw new ValidationError(`AccessRequest has already been processed`);
  }

  return models.accessRequest.updateById(id, {
    ...updatedFields,
    processed_by: userId,
    processed_date: new Date(),
  });
};
