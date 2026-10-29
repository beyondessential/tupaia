import React, { useEffect, useState } from 'react';
import { Link } from '@mui/material';
import styled from 'styled-components';

import { BannerNotification } from '../views/BannerNotification';
import { ConfirmationModal } from './ConfirmationModal';

const StyledLink = styled(Link)`
  &.MuiLink-root {
    color: inherit;
    cursor: pointer;
    text-decoration-color: currentColor;
  }
`;

let pendingRegistration: ServiceWorkerRegistration | null = null;
let notifyComponent: (() => void) | null = null;
/** Prevents double reload if controllerchange fires more than once (see workbox-window recipe). */
let controllerChangeReloadScheduled = false;

export function setUpdateReady(registration: ServiceWorkerRegistration) {
  pendingRegistration = registration;
  notifyComponent?.();
}

export const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(!!pendingRegistration);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  useEffect(() => {
    notifyComponent = () => setUpdateAvailable(true);
    if (pendingRegistration) {
      setUpdateAvailable(true);
    }

    return () => {
      notifyComponent = null;
      pendingRegistration = null;
    };
  }, []);

  if (!updateAvailable) return null;

  const handleClick = () => {
    if (!window.navigator.onLine) {
      setShowOfflineModal(true);
      return;
    }
    setShowOfflineModal(false);

    const waiting = pendingRegistration?.waiting;
    if (!waiting) {
      // The waiting worker already activated (e.g. all tabs were briefly closed).
      // A plain reload will pick up the new assets from the now-active SW.
      window.location.reload();
      return;
    }

    // Reload as soon as the new worker takes control. `controllerchange` is the usual
    // signal, but it's unreliable in standalone PWAs on iOS Safari, so also watch the
    // waiting worker's own state — it reaches 'activated' after skipWaiting even when
    // controllerchange never fires. We deliberately avoid a blind timed reload: that
    // would run under the OLD controller and re-serve the same cached bundle.
    const reloadOnce = () => {
      if (controllerChangeReloadScheduled) {
        return;
      }
      controllerChangeReloadScheduled = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);
    waiting.addEventListener('statechange', () => {
      if (waiting.state === 'activated') {
        reloadOnce();
      }
    });

    waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  return (
    <>
      <BannerNotification style={{ backgroundColor: '#002d47' }}>
        A new version of DataTrak is now available,{' '}
        <StyledLink onClick={handleClick}>click here</StyledLink> to get the latest version.
      </BannerNotification>
      <ConfirmationModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        onConfirm={() => setShowOfflineModal(false)}
        heading="No internet connection"
        description="Updating requires an active internet connection. Please connect to the internet and try again."
        confirmLabel="OK"
        cancelLabel="Dismiss"
      />
    </>
  );
};
