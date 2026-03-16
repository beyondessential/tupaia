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

    // Following the workbox-window recipe: register controllerchange listener
    // *before* messaging the worker, so it's guaranteed to be in place.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
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
