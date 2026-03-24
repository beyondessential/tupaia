import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../constants';
import { useLogoutGuard } from '../hooks/useGuardedLogout';

/**
 * Triggers the given logout callback once on mount, using a synthetic mouse
 * event to satisfy the guardedLogout signature.
 */
function useAutoLogout(guardedLogout: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    // guardedLogout expects a MouseEvent; create a synthetic one since there is
    // no real click. The event is only used to call preventDefault() when the
    // unsynced-data modal needs to be shown.
    const syntheticEvent = new MouseEvent('click') as unknown as React.MouseEvent<HTMLElement>;
    guardedLogout(syntheticEvent);
  }, [guardedLogout]);
}

/**
 * A dedicated logout route. Navigating here triggers the logout flow, which
 * means the survey navigation blocker can intercept and confirm before any auth
 * state is cleared. Once the page mounts it immediately calls guardedLogout,
 * which either logs out directly or shows the unsynced-data confirmation modal.
 */
export const LogoutPage = () => {
  const navigate = useNavigate();

  const { guardedLogout, confirmationModal } = useLogoutGuard({
    // Navigate home if the user cancels so they don't stay on the /logout route.
    onClose: () => navigate(ROUTES.HOME),
  });

  useAutoLogout(guardedLogout);

  return <>{confirmationModal}</>;
};
