import React from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { QrCodeImage } from '../src/components';

export default {
  title: 'QrCodeVisual',
  component: QrCodeImage,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

export const singleQrCode = () => (
  <Container>
    <QrCodeImage humanReadableId="xyz-123-45" qrCodeContents="qr-code-visual" />
  </Container>
);

export const multiQrCode = () => (
  <Container>
    <QrCodeImage humanReadableId="xxx-111-45" qrCodeContents="qr-code" />
    <QrCodeImage humanReadableId="yyy-2245" qrCodeContents="code-visual" />
    <QrCodeImage humanReadableId="zzz-333-89" qrCodeContents="qr-code-visual" />
    <QrCodeImage humanReadableId="aaa-1-45" qrCodeContents="qr-code-visual-1" />
  </Container>
);
