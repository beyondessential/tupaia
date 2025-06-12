/*
 * Adapted from https://github.com/bsonntag/react-use-geolocation, which is distributed under the
 * MIT License.
 */

import { useEffect, useState } from 'react';

export const GEOLOCATION_UNSUPPORTED_ERROR = {
  /** @privateRemarks Not a real {@link GeolocationPositionError} code. */
  code: -1,
  message: 'Your device or browser doesn’t support location services',
} as const;

interface UseCurrentPositionParams extends PositionOptions {
  enabled?: boolean;
}

export function useCurrentPosition({
  enableHighAccuracy = true,
  timeout,
  maximumAge,
  enabled = true,
}: UseCurrentPositionParams = {}): [
  GeolocationPosition | null,
  GeolocationPositionError | typeof GEOLOCATION_UNSUPPORTED_ERROR | null,
] {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<
    GeolocationPositionError | typeof GEOLOCATION_UNSUPPORTED_ERROR | null
  >(null);

  useEffect(() => {
    let aborted = false;

    if (enabled) {
      if (!('geolocation' in navigator)) {
        setError(GEOLOCATION_UNSUPPORTED_ERROR);
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
    }

    return () => {
      aborted = true;
    };
  }, [enableHighAccuracy, timeout, maximumAge]);

  return [position, error];
}
