import { useEffect, useRef } from 'react';
import { useLogout } from '../api/mutations';

/**
 * A dedicated logout route. Navigating here triggers the logout flow, which
 * means the survey navigation blocker and unsynced data guard can intercept
 * and confirm before any auth state is cleared.
 */
export const LogoutPage = () => {
  const { mutate: logOut } = useLogout();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    logOut();
  }, [logOut]);

  return null;
};
