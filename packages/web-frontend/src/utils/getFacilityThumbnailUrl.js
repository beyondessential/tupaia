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

  const dir = photoUrl.includes('dev_uploads') ? 'dev_uploads' : 'uploads';

  return photoUrl.replace(`/${dir}/`, `/thumbnails/${dir}/`).replace('.png', '.jpg');
};
