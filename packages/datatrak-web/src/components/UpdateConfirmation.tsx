import React, { useEffect, useState } from 'react';
import { Link } from '@mui/material';
import styled from 'styled-components';

import { BannerNotification } from '../views/BannerNotification';

const StyledLink = styled(Link)`
  &.MuiLink-root {
    color: inherit;
    cursor: pointer;
    text-decoration-color: currentColor;
  }
`;

let pendingWorker: ServiceWorker | null = null;
let notifyComponent: (() => void) | null = null;

export function setWaitingWorker(worker: ServiceWorker) {
  pendingWorker = worker;
  notifyComponent?.();
}

export const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(!!pendingWorker);

  useEffect(() => {
    notifyComponent = () => setUpdateAvailable(true);
    if (pendingWorker) {
      setUpdateAvailable(true);
    }

    return () => {
      notifyComponent = null;
      pendingWorker = null;
    };
  }, []);

  if (!updateAvailable) return null;

  const handleClick = () => {
    pendingWorker?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  return (
    <BannerNotification style={{ backgroundColor: '#002d47' }}>
      A new version of DataTrak is now available,{' '}
      <StyledLink onClick={handleClick}>click here</StyledLink> to get the latest version.
    </BannerNotification>
  );
};
