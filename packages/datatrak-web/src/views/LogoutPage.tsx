import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../constants';
import { useLogoutGuard } from '../hooks/useGuardedLogout';

/**
 * A dedicated logout route. Navigating here triggers the logout flow, which
 * means the survey navigation blocker can intercept and confirm before any auth
 * state is cleared. Once the page mounts it immediately calls guardedLogout,
 * which either logs out directly or shows the unsynced-data confirmation modal.
 */
export const LogoutPage = () => {
  const navigate = useNavigate();
  const hasTriggered = useRef(false);

  const { guardedLogout, confirmationModal } = useLogoutGuard({
    // Navigate home if the user cancels so they don't stay on the /logout route.
    onClose: () => navigate(ROUTES.HOME),
  });

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    guardedLogout();
  }, [guardedLogout]);

  return <>{confirmationModal}</>;
};
