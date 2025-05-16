import { useState, useEffect, useCallback } from 'react';

async function isVideoInputAvailable(): Promise<boolean> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.some(device => device.kind === 'videoinput');
}

/**
 * Returns a boolean representing whether a video input device (e.g. a camera) is available, or
 * `undefined` if the result is still pending.
 */
export function useHasVideoInput(): boolean | undefined {
  const [hasVideoInput, setHasVideoInput] = useState<boolean | undefined>(undefined);

  const onDeviceChange = useCallback(async () => {
    const newValue = await isVideoInputAvailable();
    if (newValue !== hasVideoInput) setHasVideoInput(newValue);
  }, [hasVideoInput]);

  // Set “initial” value (that isn’t undefined)
  useEffect(() => {
    onDeviceChange();
  }, [onDeviceChange]);

  // Keep synchronised with browser
  useEffect(() => {
    window.addEventListener('devicechange', onDeviceChange);
    return () => window.removeEventListener('devicechange', onDeviceChange);
  }, [onDeviceChange]);

  return hasVideoInput;
}
