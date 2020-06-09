/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const editAccessRequest = (models, id, updatedFields, { userId }) =>
  models.accessRequest.updateById(
    id,
    updatedFields.approved
      ? {
          ...updatedFields,
          approving_user_id: userId,
          approval_date: new Date(),
        }
      : { ...updatedFields, approval_note: null },
  );
