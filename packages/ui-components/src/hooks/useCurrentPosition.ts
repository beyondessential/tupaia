/*
 * Adapted from https://github.com/bsonntag/react-use-geolocation, which is distributed under the
 * MIT License.
 */

import { useEffect, useState } from 'react';

const noSupportError = {
  /**
   * {@link GeolocationPositionError.POSITION_UNAVAILABLE}, but `GeolocationPositionError` isn’t
   * available in our test environment.
   */
  code: 2,
  message: 'Your device or browser doesn’t support location services',
} as const;

export function useCurrentPosition({
  enableHighAccuracy = true,
  timeout,
  maximumAge,
}: PositionOptions = {}): [
  GeolocationPosition | null,
  GeolocationPositionError | typeof noSupportError | null,
] {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | typeof noSupportError | null>(null);

  useEffect(() => {
    let aborted = false;

    if (!('geolocation' in navigator)) {
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
