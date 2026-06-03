import React from 'react';
import { Typography, useMediaQuery, useTheme } from '@material-ui/core';
import styled, { css } from 'styled-components';
import { SafeArea } from '@tupaia/ui-components';
import { HomeLink } from '../../components';
import { InstallSection } from './InstallSection';
import { QrCodeSection } from './QrCodeSection';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-block-size: 100dvb;
  background-image: url('/images/download-background.png');
  background-position: top center;
  background-size: cover;
  background-color: ${props => props.theme.palette.background.paper};

  ${({ theme }) => css`
    ${theme.breakpoints.down('sm')} {
      background-image: url('/images/download-background-mobile.png');
    }
  `}
`;

const HeaderBar = styled(SafeArea).attrs({ as: 'header', top: true, left: true, right: true })`
  padding-block: 1rem;
  padding-inline: 1.5rem;
  background-color: white;
`;

const Container = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-block: 2rem;
  padding-inline: 1.5rem;
  max-inline-size: 70rem;
  margin: 0 auto;
  inline-size: 100%;
`;

const Heading = styled(Typography).attrs({ variant: 'h1', component: 'h1' })`
  &.MuiTypography-root {
    font-size: 2rem;
    font-weight: 500;
    margin-block-end: 2rem;
    text-align: left;
    inline-size: 100%;

    ${({ theme }) => theme.breakpoints.up('md')} {
      font-size: 3.6rem;
    }
  }
`;

const ContentColumns = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  inline-size: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    flex-direction: row;
    align-items: flex-start;
    gap: 4rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  flex: 1;
  text-align: center;

  ${({ theme }) => theme.breakpoints.up('md')} {
    align-items: flex-start;
    text-align: left;
  }
`;

const Description = styled(Typography)`
  font-size: 1rem;
  line-height: 1.4;
  text-align: left;
  color: ${({ theme }) => theme.palette.text.primary};

  ${({ theme }) => theme.breakpoints.up('md')} {
    font-size: 1.125rem;
  }
`;

const MobileMockup = styled.img`
  max-inline-size: 80%;
  block-size: auto;
`;

const DesktopMockupWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 2;
  /* Break out of Container's padding/max-width so the mockup reaches the viewport's right edge */
  margin-inline-end: calc((100% - 100vw) / 2);

  img {
    inline-size: 100%;
  }
`;

const DesktopMockup = styled.img.attrs({
  src: '/images/download-page-desktop-mockup.png',
  alt: 'Tupaia DataTrak app',
})`
  max-inline-size: 100%;
  block-size: auto;
`;

export const DownloadPage = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <HeaderBar>
        <HomeLink />
      </HeaderBar>
      <PageWrapper>
        <Container>
          <Heading>Welcome to Tupaia DataTrak mobile!</Heading>
          <ContentColumns>
            <LeftColumn>
              <Description>
                Tupaia DataTrak is a free and open source tool that can be used for data collection,
                managing tasking and generating reports. It works fully offline and is easy to get
                started. Download it to your mobile device using the QR code below.
              </Description>
              {isDesktop ? <QrCodeSection /> : <InstallSection />}
            </LeftColumn>
            {isDesktop ? (
              <DesktopMockupWrapper>
                <DesktopMockup />
              </DesktopMockupWrapper>
            ) : (
              <MobileMockup
                src="/images/download-page-mobile-mockup.png"
                alt="Tupaia DataTrak mobile app"
              />
            )}
          </ContentColumns>
        </Container>
      </PageWrapper>
    </>
  );
};
