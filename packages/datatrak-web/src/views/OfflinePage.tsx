import React from 'react';
import styled from 'styled-components';
import { SafeArea, Button as UIButton } from '@tupaia/ui-components';
import { Link as RouterLink } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { HEADER_HEIGHT } from '../constants';
import { DataTrakLogoType } from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  block-size: 100dvb;
`;

const HeaderContainer = styled(SafeArea).attrs({
  as: 'header',
  top: true,
  left: true,
  right: true,
})`
  align-items: center;
  background: ${({ theme }) => theme.palette.background.paper};
  block-size: ${HEADER_HEIGHT};
  display: flex;
  padding-block-end: 1rem;
`;

const Logo = styled(UIButton)`
  padding: 0;
  .MuiButton-label {
    block-size: 2.1rem;

    ${({ theme }) => theme.breakpoints.up('md')} {
      block-size: 2.6rem;
    }
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Logo component={RouterLink} to="/" title="Home" variant="text">
        <DataTrakLogoType titleAccess="Tupaia Datatrak logo" width={84} height={42} />
      </Logo>
    </HeaderContainer>
  );
};

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-block: 1rem;
  padding-inline: 1.5rem;
  inline-size: 45rem;
  max-inline-size: 100%;
  margin: 0 auto;
  max-height: 80%;
`;

const Button = styled(UIButton)`
  inline-size: 23rem;
  max-inline-size: 100%;
`;

const Heading = styled(Typography).attrs({ variant: 'h1' })`
  font-size: 2rem;
  font-weight: 700;
  margin-block-end: 3%;
`;

const Text = styled(Typography)`
  font-size: 1rem;
  margin-block-end: 1rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-block-end: 2rem;
    font-size: 22px;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0.5rem;
  inline-size: 25rem;
  max-inline-size: 100%;
  margin-block-end: 7%;
`;

export const OfflinePage = () => {
  const refreshPage = () => {
    location.reload();
  };
  return (
    <Container>
      <Header />
      <Body>
        <ImageContainer>
          <img src="images/pig-on-beach-holiday.svg" alt="Pig on a beach on holiday" />
        </ImageContainer>
        <Heading>You are currently offline</Heading>
        <Text>
          We are trying to reconnect you now, please check you are connected to the internet.
        </Text>
        <Button onClick={refreshPage}>Refresh page</Button>
      </Body>
    </Container>
  );
};
