/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import { AppProviders } from './AppProviders';
import { Routes } from './routes';
import { Button } from './components';

const PromptButton = styled(Button).attrs({
  color: 'secondary',
})`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  z-index: 1;
  box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14),
    0 1px 8px 0 rgba(0, 0, 0, 0.12);
`;
export const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    console.log('useEffect');
    const register = event => {
      console.log('registering');
      // Prevents the default mini-infobar or install dialog from appearing on mobile
      event.preventDefault();
      console.log('event', event);
      // Save the event because you'll need to trigger it later.
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', register);

    return () => {
      window.removeEventListener('beforeinstallprompt', register);
    };
  }, []);

  const handleClick = () => {
    // @ts-ignore
    deferredPrompt.prompt();
    // @ts-ignore
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    });
  };

  console.log('prompt', deferredPrompt);
  return (
    <AppProviders>
      {deferredPrompt && (
        <PromptButton onClick={handleClick} startIcon={<SystemUpdateAltIcon />}>
          Download DataTrak
        </PromptButton>
      )}
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </AppProviders>
  );
};
