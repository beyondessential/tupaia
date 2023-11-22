/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Link, SwipeableDrawer, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useIsMobile } from '../utils';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { useCurrentUser } from '../api';

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

const BROWSERS = {
  CHROME: 'Chrome',
  FIREFOX: 'Firefox',
  SAFARI: 'Safari',
  OPERA: 'Opera',
  EDGE: 'Edge',
};

const BROWSER_ICONS = {
  [BROWSERS.CHROME]: '/chrome-icon.png',
  [BROWSERS.FIREFOX]: '/firefox-icon.png',
  [BROWSERS.SAFARI]: '/safari-icon.png',
  [BROWSERS.OPERA]: '/opera-icon.png',
  [BROWSERS.EDGE]: '/edge-icon.png',
};

const APP_URL = {
  ANDROID: 'https://play.google.com/store/apps/details?id=com.tupaiameditrak',
  IOS: 'https://itunes.apple.com/us/app/tupaia-meditrak/id1245053537',
};

export const MobileAppPrompt = () => {
  const user = useCurrentUser();
  const [showPrompt, setShowPrompt] = useState(true);
  const isMobile = useIsMobile();
  if (!isMobile || !user.isLoggedIn) return null;

  const userAgent = window.navigator.userAgent;
  const getAppLink = () => {
    return userAgent.includes('Mac') ? APP_URL.IOS : APP_URL.ANDROID;
  };

  const getBrowser = () => {
    if (userAgent.match(/chrome|chromium|crios/i)) {
      return BROWSERS.CHROME;
    }
    if (userAgent.match(/firefox|fxios/i)) {
      return BROWSERS.FIREFOX;
    }
    if (userAgent.match(/safari/i)) {
      return BROWSERS.SAFARI;
    }
    if (userAgent.match(/opr/i)) {
      return BROWSERS.OPERA;
    }
    if (userAgent.match(/edg/i)) {
      return BROWSERS.EDGE;
    }
    return null;
  };
  const browser = getBrowser();
  const browserIcon = browser ? BROWSER_ICONS[browser] : null;
  const appLink = getAppLink();

  const togglePrompt = () => {
    setShowPrompt(!showPrompt);
  };

  const displayOptions = [
    {
      icon: '/tupaia-pin.svg',
      text: 'Datatrak app',
      button: {
        text: 'Download',
        href: appLink,
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
        <Title>Download the DataTrak app?</Title>
        <div>
          {displayOptions.map(
            ({
              icon,
              text,
              button: { onClick, href, variant = 'contained', text: buttonText },
            }) => (
              <Option key={text!}>
                <LeftColumn>
                  <OptionIcon>{icon && <img src={icon} />}</OptionIcon>
                  <OptionText>{text}</OptionText>
                </LeftColumn>
                <OptionButton
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  component={href ? Link : undefined}
                  onClick={onClick}
                  variant={variant}
                >
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
