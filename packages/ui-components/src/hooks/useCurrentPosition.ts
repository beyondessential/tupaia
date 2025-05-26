/* Adapted from https://github.com/bsonntag/react-use-geolocation */

import { useEffect, useState } from 'react';

const noSupportError = {
  code: GeolocationPositionError.POSITION_UNAVAILABLE,
  message: 'Your device or browser doesn’t support location services',
} as const;

export function useCurrentPosition({
  enableHighAccuracy = true,
  timeout,
  maximumAge,
}: PositionOptions) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | typeof noSupportError | null>(null);

  useEffect(() => {
    let aborted = false;

    if (!('geolocation' in navigator)) {
      if (aborted) return;
      setError(noSupportError);
    } else {
      const successCallback: PositionCallback = pos => {
        if (aborted) return;
        setPosition(pos);
        setError(null);
      };
      const errorCallback: PositionErrorCallback = err => {
        if (aborted) return;
        setError(err);
      };

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    }

    return () => {
      aborted = true;
    };
  }, [enableHighAccuracy, timeout, maximumAge]);

  return [position, error];
}
