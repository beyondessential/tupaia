import { useEffect } from 'react';

function handleBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
}

export function useBeforeUnload(enabled = true) {
  useEffect(() => {
    if (enabled) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);
}
