import { useEffect, useState } from 'react';

/**
 * Reactive equivalent of `window.navigator.onLine`. Re-renders when the browser fires `online`/
 * `offline` events, so consumers can gate network activity and resume it once connectivity returns.
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    const update = () => setIsOnline(window.navigator.onLine);
    update(); // re-sync in case connectivity changed before the listeners were attached
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return isOnline;
}
