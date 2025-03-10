import { useEffect } from 'react';

function handleBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault(); // For modern browsers
  event.returnValue = ''; // For legacy browsers
}

function addListener() {
  window.addEventListener('beforeunload', handleBeforeUnload);
}

function removeListener() {
  window.removeEventListener('beforeunload', handleBeforeUnload);
}

export function useBeforeUnload(enabled = true) {
  useEffect(() => {
    (enabled ? addListener : removeListener)();
    return removeListener;
  }, [enabled]);
}
