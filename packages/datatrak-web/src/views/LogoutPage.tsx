import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLogout } from '../api/mutations';

interface LogoutLocationState {
  resetDatabase?: boolean;
}

/**
 * A dedicated logout route. Navigating here triggers the logout flow, which
 * means the survey navigation blocker and unsynced data guard can intercept
 * and confirm before any auth state is cleared.
 */
export const LogoutPage = () => {
  const { mutate: logOut } = useLogout();
  const location = useLocation();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    // Forward the `resetDatabase` intent supplied by the caller (e.g. the
    // permissions-changed banner) through to the logout mutation. Normally
    // the logout mutation decides whether to wipe the local DB by reading
    // the persisted `PERMISSIONS_CHANGED` sync fact, but we've had reports
    // (intermittently, on some devices) of the
    // wipe being skipped even when the banner was visible. We haven't been
    // able to fully pin down the root cause, so this is a workaround: when
    // the caller already knows the user needs a fresh DB, it can say so
    // explicitly and the mutation will wipe regardless of what the fact reads.
    const state = (location.state ?? null) as LogoutLocationState | null;
    logOut({ resetDatabase: state?.resetDatabase === true });
  }, [logOut, location.state]);

  return null;
};
