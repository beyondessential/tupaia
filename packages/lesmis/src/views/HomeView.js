/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { NAVBAR_HEIGHT } from '../constants';
import { SearchBar, FlexSpaceBetween, FlexStart } from '../components';

const Wrapper = styled.div`
  position: relative;
  height: 800px; // fallback height for older browsers
  height: calc(100vh - ${NAVBAR_HEIGHT});
  background-size: cover;
  background-position: center;
`;

const Container = styled(MuiContainer)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 3rem;
  height: 100%;
`;

const Main = styled.div`
  position: relative;
  padding-top: 3rem; // fallback for older browsers
  padding-top: 18vh;
  left: 0;

  @media screen and (max-width: 600px) {
    padding-top: 3rem;
  }
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
  color: white;
`;

const YellowTitle = styled.span`
  color: ${props => props.theme.palette.secondary.main};
`;

const Info = styled(FlexStart)`
  color: white;

  @media screen and (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const InfoSection = styled.div`
  margin-right: 3rem;
  max-width: 18.5rem;
  padding-bottom: 3rem;
`;

const InfoHeading = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.4;
  margin-bottom: 0.6s5rem;
`;

const InfoText = styled(Typography)`
  font-size: 1ren;
  line-height: 1.5;
`;

const Footer = styled(MuiContainer)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const FooterInner = styled(FlexSpaceBetween)`
  color: white;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

export const HomeView = React.memo(() => (
  // The background image is applied here instead of the styled component as it creates a flicker when added there
  <Wrapper style={{ backgroundImage: "url('/images/home-cover.png')" }}>
    <Container maxWidth={false}>
      <Main>
        <Title variant="h1">
          Find a location <br />
          to <YellowTitle>start viewing data</YellowTitle>
        </Title>
        <SearchBar />
      </Main>
      <Info>
        <InfoSection>
          <InfoHeading variant="h5">About LESMIS</InfoHeading>
          <InfoText>
            A system to improve data quality, management and utilisation for the Ministry of
            Education and Sports
          </InfoText>
        </InfoSection>
        <InfoSection>
          <InfoHeading variant="h5">Contact us</InfoHeading>
          <InfoText>Ph: +856 20 54 015 004</InfoText>
          <InfoText>Website: www.moes.edu.la</InfoText>
        </InfoSection>
      </Info>
      <Footer maxWidth={false}>
        <FooterInner>
          <Link color="inherit" href="https://info.tupaia.org/">
            Copyright
          </Link>
          <Typography>
            Powered by{' '}
            <Link href="https://info.tupaia.org/" color="inherit" underline="always">
              Tupaia
            </Link>
          </Typography>
        </FooterInner>
      </Footer>
    </Container>
  </Wrapper>
));
