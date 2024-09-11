/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, IconButton, SmallAlert } from '@tupaia/ui-components';
import { QrReader } from 'react-qr-reader';
// This import is the actual type that QrReader uses
import { Result } from '@zxing/library';
import { QRScanIcon } from './QRScanIcon';
import { ClickAwayListener, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useEntityById } from '../../api/queries';
import { generatePath, useLocation, useNavigate, useParams } from 'react-router';
import { ROUTE_STRUCTURE } from '../../constants';

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

export const QRCodeScanner = ({ onCloseEntitySearch }: { onCloseEntitySearch: () => void }) => {
  const { projectCode, dashboardName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [qrCodeScanError, setQrCodeScanError] = useState<string | null>(null);

  const toggleQRScanner = () => setIsQRScannerOpen(!isQRScannerOpen);

  const directToEntity = result => {
    if (!result) {
      return setQrCodeScanError(
        'No matching entity found in selected project. Please try another QR code, or check your project selection.',
      );
    }
    const { code } = result;
    const path = generatePath(ROUTE_STRUCTURE, {
      projectCode,
      dashboardName,
      entityCode: code,
    });

    // navigate to the entity page and close the scanner and entity search
    navigate({
      ...location,
      pathname: path,
    });

    setIsQRScannerOpen(false);
    onCloseEntitySearch();
  };

  const { error: entityError } = useEntityById(
    projectCode,
    entityId ?? '',
    ['code'],
    directToEntity,
  );

  const error = qrCodeScanError || (entityError as Error)?.message;

  const handleScan = (data?: Result | null, error?: Error | null) => {
    if (data) {
      const text = data.getText();
      const entityId = text.replace('entity-', '');
      setEntityId(entityId);
    }

    if (error) {
      setQrCodeScanError(error.message);
    }
  };

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
            {error && <SmallAlert severity="error">{error}</SmallAlert>}
            <QrReader
              // use the camera facing the environment (back camera)
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
            />
          </ScannerWrapper>
        </ClickAwayListener>
      )}
    </>
  );
};
