import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  SearchBar,
  FlexSpaceBetween,
  FlexStart,
  I18n,
  LocaleMenu,
  FooterLogos,
} from '../components';
import { NAVBAR_HEIGHT, YELLOW, PHONE_CONTACT, WEBSITE_CONTACT } from '../constants';
import { useProjectEntitiesData } from '../api/queries';

const Wrapper = styled.div`
  position: relative;
  height: 800px; // fallback height for older browsers
  height: calc(100vh - ${NAVBAR_HEIGHT});
  background-size: cover;
  background-position: right top;
`;

const Container = styled(MuiContainer)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 3rem;
  height: 100%;

  @media screen and (min-width: 600px) {
    padding-left: 50px;
  }
`;

const LightLocaleMenu = styled(LocaleMenu)`
  position: absolute;
  right: 24px;
  top: 1rem;
  padding: 6px 15px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1;

  .MuiSvgIcon-root {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const Main = styled.div`
  position: relative;
  padding-top: 3rem; // fallback for older browsers
  padding-top: 17vh;
  left: 0;

  @media screen and (max-width: 600px) {
    padding-top: 4rem;
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
  color: ${YELLOW};
`;

const Info = styled(FlexStart)`
  align-items: flex-start;
  color: white;

  @media screen and (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const InfoSection = styled.div`
  margin-right: 4rem;
  max-width: 20rem;
  padding-bottom: 2.5rem;
`;

const InfoHeading = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.4;
  margin-bottom: 0.65rem;
`;

const InfoText = styled(Typography)`
  font-size: 1rem;
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

  @media screen and (min-width: 600px) {
    padding-left: 1.5rem;
  }

  .MuiTypography-root {
    font-size: 0.85rem;
  }
`;

const INFO_LINK = 'https://info.tupaia.org';

// Don't wrap HomeView with React.memo as it will prevent the useProjectEntitiesData hooking
// running and the loading state will not display correctly
export const HomeView = () => {
  const { isLoading } = useProjectEntitiesData();

  return (
    // The background image is applied here instead of the styled component as it creates a flicker when added there
    <Wrapper style={{ backgroundImage: "url('/images/home-cover.png')" }}>
      <Container maxWidth="xl">
        <LightLocaleMenu />
        <Main>
          <Title variant="h1">
            <I18n t="home.findALocation" />
            <br />
            <I18n t="home.to" />{' '}
            <YellowTitle>
              <I18n t="home.startViewingData" />
            </YellowTitle>
          </Title>
          {isLoading && <CircularProgress size={60} />}
          <SearchBar />
        </Main>
        <Info>
          <InfoSection>
            <InfoHeading variant="h5">
              <I18n t="home.aboutLesmis" />
            </InfoHeading>
            <InfoText>
              <I18n t="home.aboutText" />
            </InfoText>
          </InfoSection>
          <InfoSection>
            <InfoHeading variant="h5">
              <I18n t="home.contactUs" />
            </InfoHeading>
            <InfoText>
              <I18n t="home.ph" />: {PHONE_CONTACT}
            </InfoText>
            <InfoText>
              <I18n t="home.website" />: {WEBSITE_CONTACT}
            </InfoText>
          </InfoSection>
        </Info>
        <Footer maxWidth="xl">
          <FooterInner>
            <FooterLogos />
            <Typography>
              <I18n t="home.poweredBy" />{' '}
              <Link href={INFO_LINK} color="inherit" underline="always">
                Tupaia
              </Link>
            </Typography>
          </FooterInner>
        </Footer>
      </Container>
    </Wrapper>
  );
};
