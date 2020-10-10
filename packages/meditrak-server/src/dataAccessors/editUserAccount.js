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
    if (profileImage.data && profileImage.fileId) {
      const profileImagePath = await uploadImage(profileImage.data, profileImage.fileId);
      updatedFields = {
        ...updatedFields,
        profile_image: profileImagePath,
      };
    } else {
      updatedFields = {
        ...updatedFields,
        profile_image: null,
      };
    }
  }

  return models.user.updateById(id, updatedFields);
};
