import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import PWAPrompt from 'react-ios-pwa-prompt';
import { Button as UIButton } from '@tupaia/ui-components';
import { AndroidIcon, AppleIcon } from '../../components/Icons';
import { usePwaInstallPrompt } from '../../hooks/usePwaInstallPrompt';
import { isAndroidDevice, isIosDevice } from '../../utils/detectDevice';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const DownloadButton = styled(UIButton)`
  inline-size: 100%;
  gap: 0.5rem;
  background-color: ${props => props.theme.palette.primary.main};
`;

const HelpText = styled(Typography).attrs({ variant: 'body2' })`
  color: ${({ theme }) => theme.palette.text.secondary};
  max-inline-size: 18rem;
  margin-block-start: 0.25rem;
`;

const InstalledMessage = styled(Typography)`
  color: ${({ theme }) => theme.palette.success.dark};
  font-weight: 600;
  margin-block-end: 1rem;
`;

const AlreadyInstalled = () => (
  <Section>
    <InstalledMessage>Tupaia DataTrak is already installed</InstalledMessage>
    <DownloadButton component="a" href="/">
      Open DataTrak
    </DownloadButton>
  </Section>
);

const InstallPrompt = () => {
  const { canPromptInstall, promptInstall } = usePwaInstallPrompt();
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  const iosDevice = isIosDevice();
  const canInstall = canPromptInstall || iosDevice;

  const handleInstallClick = () => {
    if (canPromptInstall) {
      promptInstall();
      return;
    }
    if (iosDevice) {
      setShowIosPrompt(true);
    }
  };

  return (
    <Section>
      <DownloadButton
        onClick={canInstall ? handleInstallClick : undefined}
        startIcon={
          <>
            <AppleIcon fontSize="small" />
            <AndroidIcon fontSize="small" />
          </>
        }
      >
        Install for iOS or Android
      </DownloadButton>
      {isAndroidDevice() && !canPromptInstall && (
        <HelpText>
          On Android, tap the menu button in Chrome, then select &ldquo;Add to Home Screen&rdquo; or
          &ldquo;Install App&rdquo;.
        </HelpText>
      )}
      <PWAPrompt
        isShown={showIosPrompt}
        onClose={() => setShowIosPrompt(false)}
        copyTitle="Install Tupaia DataTrak"
        copyDescription="DataTrak works fully offline once installed. Add it to your home screen to launch it like a native app."
        copyShareStep="Tap the Share button in Safari's menu bar."
        copyAddToHomeScreenStep="Tap 'Add to Home Screen' to install."
      />
    </Section>
  );
};

export const InstallSection = () => {
  const { isAppInstalled } = usePwaInstallPrompt();
  return isAppInstalled ? <AlreadyInstalled /> : <InstallPrompt />;
};
