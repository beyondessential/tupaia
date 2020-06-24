/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';

export const editUserAccount = (models, id, { password, ...restOfUpdatedFields }) => {
  let updatedFields = restOfUpdatedFields;
  if (password) {
    updatedFields = {
      ...updatedFields,
      ...hashAndSaltPassword(password),
    };
  }
  return models.user.updateById(id, updatedFields);
};
