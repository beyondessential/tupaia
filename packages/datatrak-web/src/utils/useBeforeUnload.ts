import { useEffect } from 'react';

function handleBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault(); // For modern browsers
  event.returnValue = ''; // For legacy browsers
}

export function useBeforeUnload(enabled = true) {
  useEffect(() => {
    if (enabled) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [enabled]);
}
