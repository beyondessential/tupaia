/* Adapted from https://github.com/bsonntag/react-use-geolocation */

import { useEffect, useState } from 'react';

export function useCurrentPosition({
  enableHighAccuracy = true,
  timeout,
  maximumAge,
}: PositionOptions) {
  const [position, setPosition] = useState<GeolocationPosition | null | undefined>(undefined);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  useEffect(() => {
    let aborted = false;

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

    return () => {
      aborted = true;
    };
  }, [enableHighAccuracy, timeout, maximumAge]);

  return [position, error];
}
