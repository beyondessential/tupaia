/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

export const getFacilityThumbnailUrl = orgUnit => {
  const { photoUrl } = orgUnit;

  if (!photoUrl) {
    return null;
  }

  // TODO handle dev uploads as thumbnails https://github.com/beyondessential/tupaia-backlog/issues/960
  if (photoUrl.includes('dev_uploads')) {
    return photoUrl;
  }
  return photoUrl.replace('/uploads/', '/thumbnails/uploads/').replace('.png', '.jpg');
};
