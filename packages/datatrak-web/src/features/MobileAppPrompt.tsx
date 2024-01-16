/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { SwipeableDrawer, Typography } from '@material-ui/core';
import { Button } from '@tupaia/ui-components';
import { BROWSERS, getBrowser, getIsMobileDevice } from '../utils';

const Container = styled.div`
  padding: 2.2rem 1.25rem 3.4rem 1.25rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.125rem;
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const LeftColumn = styled.div`
  display: flex;
  align-items: center;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  justify-content: space-between;
`;

const OptionIcon = styled.div`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  width: 2.8rem;
  height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem;
  border-radius: 4px;
  margin: 0 0.625rem;
  img {
    height: 100%;
    width: auto;
  }
`;

const OptionText = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const OptionButton = styled(Button)`
  border-radius: 2rem;
  width: 7rem;
  font-weight: 400;
`;

const BROWSER_ICONS = {
  [BROWSERS.CHROME]: '/chrome-icon.png',
  [BROWSERS.FIREFOX]: '/firefox-icon.png',
  [BROWSERS.SAFARI]: '/safari-icon.png',
  [BROWSERS.OPERA]: '/opera-icon.png',
  [BROWSERS.EDGE]: '/edge-icon.png',
};

const APP_TARGET = 'tupaiameditrak://';

const APP_STORE_URL = {
  ANDROID: 'https://play.google.com/store/apps/details?id=com.tupaiameditrak',
  IOS: 'https://itunes.apple.com/app/tupaia-meditrak/id1245053537',
};

const COOKIE_NAME = 'promptedCookie';

const usePromptCookie = () => {
  const setCookie = () => {
    const date = new Date();
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // 24 hours, in milliseconds
    const expires = 'expires=' + date.toUTCString();
    const cookie = `${COOKIE_NAME}=${true};${expires};path=/`;
    document.cookie = cookie;
  };

  const getCookie = () => {
    // get the cookie
    const cname = `${COOKIE_NAME}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    // split the cookie into an array

    const ca = decodedCookie.split(';');
    // return the value of the cookie if it exists, otherwise return undefined
    return ca
      .find(cookie => cookie.trim().startsWith(cname))
      ?.trim()
      .substring(cname.length);
  };

  const hasBeenPromptedCookie = getCookie();
  // set the initial state as true if the cookie exists, otherwise false
  const [prompted, setPrompted] = useState(!!hasBeenPromptedCookie);

  const setHasBeenPrompted = () => {
    setCookie();
    setPrompted(true);
  };

  return {
    prompted,
    setHasBeenPrompted,
  };
};

const getAppStoreLink = () => {
  const userAgent = window.navigator.userAgent;
  return userAgent.includes('Mac') ? APP_STORE_URL.IOS : APP_STORE_URL.ANDROID;
};

export const MobileAppPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(true);
  const isMobile = getIsMobileDevice();
  const { prompted, setHasBeenPrompted } = usePromptCookie();
  if (!isMobile || prompted) return null;

  const browser = getBrowser();
  const browserIcon = browser ? BROWSER_ICONS[browser] : null;
  const appStoreLink = getAppStoreLink();

  const onOpenApp = () => {
    togglePrompt();
    window.location.href = APP_TARGET; // eventually this is where the deep link will go
    // Set a timeout to redirect to the app store after a reasonable time
    setTimeout(() => {
      window.location.href = appStoreLink;
    }, 2000);
  };

  const togglePrompt = () => {
    // only set the cookie if the user has clicked on one of the options
    setShowPrompt(!showPrompt);
    setHasBeenPrompted();
  };

  const displayOptions = [
    {
      icon: '/tupaia-pin.svg',
      text: 'Datatrak app',
      button: {
        text: 'Open',
        onClick: onOpenApp,
      },
    },
    {
      icon: browserIcon,
      text: browser,
      button: {
        text: 'Continue',
        onClick: togglePrompt,
        variant: 'outlined',
      },
    },
  ];

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={showPrompt}
      onClose={togglePrompt}
      onOpen={togglePrompt}
      disableDiscovery
      disableSwipeToOpen
      PaperProps={{
        style: {
          borderRadius: '0.625rem 0.625rem 0 0',
        },
      }}
    >
      <Container>
        <Title>Open the DataTrak app?</Title>
        <div>
          {displayOptions.map(
            ({ icon, text, button: { onClick, variant = 'contained', text: buttonText } }) => (
              <Option key={text!}>
                <LeftColumn>
                  <OptionIcon>{icon && <img src={icon} />}</OptionIcon>
                  <OptionText>{text}</OptionText>
                </LeftColumn>
                <OptionButton onClick={onClick} variant={variant}>
                  {buttonText}
                </OptionButton>
              </Option>
            ),
          )}
        </div>
      </Container>
    </SwipeableDrawer>
  );
};
