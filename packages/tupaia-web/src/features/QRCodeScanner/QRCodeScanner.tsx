/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, IconButton } from '@tupaia/ui-components';
import { QrReader } from 'react-qr-reader';
import { Result as ResultType } from '@zxing/library/esm/core/Result';
import { QRScanIcon } from './QRScanIcon';
import { ClickAwayListener, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';

const QRScanButton = styled(Button).attrs({
  startIcon: <QRScanIcon />,
  variant: 'text',
})`
  background: ${({ theme }) => theme.palette.background.paper};
  text-transform: none;
  font-size: 0.875rem;
  font-weight: 400;
  padding-inline: 0.5rem;
  white-space: nowrap;
  height: 100%;
`;

const ScannerWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 10;
  background: ${({ theme }) => theme.palette.background.paper};
  padding-inline: 1.4rem;
  padding-block: 1.2rem;
`;

const CloseButton = styled(IconButton)`
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
  padding: 0.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 0.75rem;
  font-weight: 500;
`;

export const QRCodeScanner = () => {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [data, setData] = useState<ResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toggleQRScanner = () => setIsQRScannerOpen(!isQRScannerOpen);

  return (
    <>
      <QRScanButton onClick={toggleQRScanner}>Scan ID</QRScanButton>
      {isQRScannerOpen && (
        <ClickAwayListener onClickAway={toggleQRScanner}>
          <ScannerWrapper>
            <Header>
              <Title>Scan the location ID QR code using your camera</Title>
              <CloseButton onClick={toggleQRScanner}>
                <Close />
              </CloseButton>
            </Header>
            <QrReader
              constraints={{ facingMode: 'environment' }}
              scanDelay={0}
              onResult={(result, error) => {
                if (!!result) {
                  setData(result);
                }

                if (error) {
                  setError(error.message);
                }
              }}
            />
          </ScannerWrapper>
        </ClickAwayListener>
      )}
    </>
  );
};
