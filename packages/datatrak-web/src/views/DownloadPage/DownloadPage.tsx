import React from 'react';
import { Typography } from '@material-ui/core';
import styled, { css } from 'styled-components';
import { Button as UIButton, QrCodeImage, SafeArea } from '@tupaia/ui-components';
import { HomeLink } from '../../components';
import { AndroidIcon, AppleIcon } from '../../components/Icons';
import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt';
import { isAndroidDevice } from '../../utils/detectDevice';
import { ROUTES } from '../../constants';

const DOWNLOAD_URL = `${window.location.origin}${ROUTES.DOWNLOAD}`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-block-size: 100dvb;
  background-image: url('/images/download-background.png');
  background-position: top center;
  background-size: cover;

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

const RightColumn = styled.div<{ $visibility?: Visibility }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;

  ${({ $visibility }) => visibilityCss($visibility)}
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

type Visibility = 'mobile' | 'desktop';

const visibilityCss = ($visibility?: Visibility) => {
  if (!$visibility) return '';
  if ($visibility === 'mobile')
    return css`
      ${({ theme }) => theme.breakpoints.up('md')} {
        display: none;
      }
    `;
  return css`
    display: none;
    ${({ theme }) => theme.breakpoints.up('md')} {
      display: flex;
    }
  `;
};

const SectionLabel = styled(Typography)`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-block-end: 1rem;
`;

const Section = styled.section<{ $visibility?: Visibility }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  ${({ theme }) => theme.breakpoints.up('md')} {
    align-items: flex-start;
  }

  ${({ $visibility }) => visibilityCss($visibility)}
`;

const DownloadButton = styled(UIButton)`
  inline-size: 100%;
  gap: 0.5rem;
  background-color: #004975;
`;

const StyledQrCode = styled(QrCodeImage)`
  inline-size: 180px;
  outline: none;
`;

const HelpText = styled(Typography).attrs({ variant: 'body2' })`
  color: ${({ theme }) => theme.palette.text.secondary};
  max-inline-size: 18rem;
  margin-block-start: 0.25rem;
`;

const InstalledMessage = styled(Typography)`
  color: ${({ theme }) => theme.palette.success.main};
  font-weight: 600;
  margin-block-end: 1rem;
`;

const MockupImage = styled.img<{ $visibility?: Visibility }>`
  max-inline-size: 100%;
  block-size: auto;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    max-inline-size: 80%;
  }

  ${({ $visibility }) => visibilityCss($visibility)}
`;

const isIosDevice = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

const MobileSection = () => {
  const { isAppInstalled, canPromptInstall, promptInstall } = usePwaInstallPrompt();

  if (isAppInstalled) {
    return (
      <Section $visibility="mobile">
        <InstalledMessage>Tupaia DataTrak is already installed</InstalledMessage>
        <DownloadButton component="a" href="/">
          Open DataTrak
        </DownloadButton>
      </Section>
    );
  }

  return (
    <Section $visibility="mobile">
      <DownloadButton
        onClick={canPromptInstall ? promptInstall : undefined}
        startIcon={
          <>
            <AppleIcon fontSize="small" />
            <AndroidIcon fontSize="small" />
          </>
        }
      >
        Install for iOS or Android
      </DownloadButton>
      {isIosDevice() && (
        <HelpText>
          On iOS, tap the Share button in Safari, then select &ldquo;Add to Home Screen&rdquo;.
        </HelpText>
      )}
      {isAndroidDevice() && !canPromptInstall && (
        <HelpText>
          On Android, tap the menu button in Chrome, then select &ldquo;Add to Home Screen&rdquo; or
          &ldquo;Install App&rdquo;.
        </HelpText>
      )}
    </Section>
  );
};

const QRCodeSection = () => (
  <Section $visibility="desktop">
    <SectionLabel>Scan to download on your phone</SectionLabel>
    <StyledQrCode qrCodeContents={DOWNLOAD_URL} />
  </Section>
);

export const DownloadPage = () => {
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
              <MobileSection />
              <QRCodeSection />
            </LeftColumn>
            <MockupImage
              $visibility="mobile"
              src="/images/download-page-mobile-mockup.png"
              alt="Tupaia DataTrak mobile app"
            />
            <RightColumn $visibility="desktop">
              <MockupImage
                src="/images/download-page-desktop-mockup.png"
                alt="Tupaia DataTrak app"
              />
            </RightColumn>
          </ContentColumns>
        </Container>
      </PageWrapper>
    </>
  );
};
