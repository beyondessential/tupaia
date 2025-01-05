import React from 'react';
import styled from 'styled-components';
import { Button as UIButton } from '@tupaia/ui-components';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button as MUIButton } from '@material-ui/core';
import { HEADER_HEIGHT } from '../constants';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  height: ${HEADER_HEIGHT};
  padding: 0 1rem;
  margin: 0 auto;
  max-width: 75rem;
`;

const Logo = styled(MUIButton)`
  .MuiButton-label {
    height: 2.1rem;

    ${({ theme }) => theme.breakpoints.up('md')} {
      height: 2.6rem;
    }
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo component={RouterLink} to="/" title="Home">
          <img
            src="/datatrak-logo-black.svg"
            alt="Tupaia Datatrak logo"
            width="100%"
            height="100%"
          />
        </Logo>
      </HeaderInner>
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
  padding: 5% 1rem 1rem;
  width: 37.5rem;
  max-width: 100%;
  margin: 0 auto;
`;

const Button = styled(UIButton)`
  width: 23rem;
  max-width: 100%;
`;

const Heading = styled(Typography).attrs({ variant: 'h1' })`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5%;
`;

const Text = styled(Typography)`
  font-size: 1rem;
  margin-bottom: 5%;

  ${({ theme }) => theme.breakpoints.up('md')} {
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
  margin-bottom: 5%;
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
