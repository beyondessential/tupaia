import React, { useState } from 'react';
import { SwipeableDrawer } from '@material-ui/core';
import styled from 'styled-components';
import { getIsMobileDevice, isWebApp } from '../../utils';
import { useCurrentUserContext } from '../../api';
import { InstallPrompt } from './InstallPrompt';
import { InstallInstructions } from './InstallInstructions';
import { useBeforeInstallPrompt } from './useBeforeInstallPrompt';
import { MobileAppPrompt } from '../MobileAppPrompt';
import { OpenPrompt } from './OpenPrompt';

const Container = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-block: 1rem 2rem;
  padding-inline: 1.25rem;
`;

const TopBar = styled.div`
  border-radius: 10px;
  height: 4px;
  width: 72px;
  margin: 0.6rem auto 0;
  background: #d9d9d9;
`;

const Drawer = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const togglePrompt = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpen}
      onClose={togglePrompt}
      onOpen={togglePrompt}
      disableDiscovery
      disableSwipeToOpen
      PaperProps={{
        style: {
          borderStartStartRadius: '0.625rem',
          borderStartEndRadius: '0.625rem',
        },
      }}
    >
      <TopBar />
      <Container>{children}</Container>
    </SwipeableDrawer>
  );
};

// In case this needs to be behind a feature flag
const isLegacy = false;

const isInstalled = true;

export const WebAppPrompt = () => {
  const user = useCurrentUserContext();
  const isMobile = getIsMobileDevice();
  const deferredPrompt = useBeforeInstallPrompt();

  if (!isMobile || !user.isLoggedIn || isWebApp()) {
    return null;
  }

  if (isInstalled) {
    return <OpenPrompt />;
  }

  if (isLegacy) {
    return <MobileAppPrompt />;
  }

  if (deferredPrompt) {
    return (
      <Drawer>
        <InstallPrompt
          onInstall={() => {
            deferredPrompt.prompt();
          }}
        />
      </Drawer>
    );
  }

  return (
    <Drawer>
      <InstallInstructions />
    </Drawer>
  );
};
