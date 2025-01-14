import React, { useState } from 'react';
import styled from 'styled-components';
import { SwipeableDrawer, Typography } from '@material-ui/core';
import { Button } from '@tupaia/ui-components';
import { getIsMobileDevice } from '../utils';
import { useCurrentUserContext } from '../api';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 2rem;
`;

const TopBar = styled.div`
  border-radius: 10px;
  height: 4px;
  width: 72px;
  margin: 0.6rem auto 0;
  background: #d9d9d9;
`;

const LeftColumn = styled.div`
  display: flex;
  align-items: center;
`;

const LeftCell = styled.div``;

const Pin = styled.img.attrs({
  src: '/tupaia-pin.svg',
  ['aria-hidden']: true, // this pin is not of any use to the screen reader, so hide from the screen reader
})`
  width: 1rem;
  height: auto;
  margin-right: 0.5rem;
`;
const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.125rem;
  text-align: center;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;
const Text = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const InstallButton = styled(Button)`
  border-radius: 2rem;
  width: 7rem;
  font-weight: 400;
`;

export const WebAppPrompt = () => {
  const user = useCurrentUserContext();
  const [showPrompt, setShowPrompt] = useState(true);
  const isMobile = getIsMobileDevice();

  if (!isMobile || !user.isLoggedIn) {
    return null;
  }
  const togglePrompt = () => {
    setShowPrompt(!showPrompt);
  };

  const onInstall = () => {
    togglePrompt();
    console.log('Install app');
  };

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
      <TopBar />
      <Container>
        <LeftColumn>
          <Pin />
          <LeftCell>
            <Title>Tupaia Datatrak</Title>
            <Text>datatrak.tupaia.org</Text>
          </LeftCell>
        </LeftColumn>
        <InstallButton onClick={onInstall}>Install</InstallButton>
      </Container>
    </SwipeableDrawer>
  );
};
