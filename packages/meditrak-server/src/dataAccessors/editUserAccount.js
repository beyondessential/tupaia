/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { uploadImage } from '../s3';

export const editUserAccount = async (
  models,
  id,
  { password, profileImage, ...restOfUpdatedFields },
) => {
  let updatedFields = restOfUpdatedFields;
  if (password) {
    updatedFields = {
      ...updatedFields,
      ...hashAndSaltPassword(password),
    };
  }
  if (profileImage) {
    const profileImagePath = await uploadImage(profileImage.data, profileImage.fileId);
    updatedFields = {
      ...updatedFields,
      profile_image: profileImagePath,
    };
  }
  return models.user.updateById(id, updatedFields);
};
