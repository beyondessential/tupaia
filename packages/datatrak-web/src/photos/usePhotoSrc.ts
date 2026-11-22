import { useEffect, useState } from 'react';
import log from 'winston';

import { isObjectId } from '@tupaia/tsutils';

import { findPhoto } from './photoFiles';

/**
 * Something an `<img>` can show for a Photo answer.
 *
 * Mostly that’s the answer itself: a URL, or a data URL. But a photo submitted on this device and
 * not yet synced is a file on the device, and the answer holds just its ID (see `photoFiles`).
 *
 * @returns `undefined` while a photo on the device is being found, or if it isn’t there
 */
export const usePhotoSrc = (answer: string | null | undefined): string | undefined => {
  const isOnDevice = typeof answer === 'string' && isObjectId(answer);
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    if (!isOnDevice) return;

    let isCurrent = true;
    let url: string | undefined;
    findPhoto(answer)
      .then(file => {
        if (!isCurrent || !file) return;
        url = URL.createObjectURL(file);
        setObjectUrl(url);
      })
      .catch(error => log.warn('usePhotoSrc: couldn’t read photo', { error }));

    return () => {
      isCurrent = false;
      if (url) URL.revokeObjectURL(url);
      setObjectUrl(undefined);
    };
  }, [answer, isOnDevice]);

  return isOnDevice ? objectUrl : (answer ?? undefined);
};
