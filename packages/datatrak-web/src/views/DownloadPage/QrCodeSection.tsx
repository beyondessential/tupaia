import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { QrCodeImage } from '@tupaia/ui-components';
import { AndroidIcon, AppleIcon } from '../../components/Icons';
import { ROUTES } from '../../constants';

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
`;

const QRCodeBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 40px;
  border-radius: 10px;
  border: 1px solid ${props => props.theme.palette.primary.dark};
  background: rgba(255, 255, 255, 0.5);
`;

const QRCodeIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.theme.palette.primary.dark};
`;

const StyledQrCode = styled(QrCodeImage)`
  inline-size: 180px;
  outline: none;
`;

export const QrCodeSection = () => (
  <Section>
    <QRCodeBox>
      <QRCodeIcons>
        <AppleIcon />
        <AndroidIcon />
      </QRCodeIcons>
      <Typography variant="body2">Scan to install for iOS or Android</Typography>
      <StyledQrCode qrCodeContents={`${window.location.origin}${ROUTES.DOWNLOAD}`} />
    </QRCodeBox>
  </Section>
);
