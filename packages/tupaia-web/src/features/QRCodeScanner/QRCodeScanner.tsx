import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, IconButton, SmallAlert } from '@tupaia/ui-components';
import { QrReader } from 'react-qr-reader';
import { get } from '../../api';
// This import is the actual type that QrReader uses
import { Result } from '@zxing/library';
import { QRScanIcon } from './QRScanIcon';
import { ClickAwayListener, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleQRScanner = () => {
    setIsQRScannerOpen(!isQRScannerOpen);
    setErrorMessage(null);
  };

  const handleScan = async (data?: Result | null, error?: Error | null) => {
    if (error?.message) {
      setErrorMessage(error.message);
    }

    if (!data) {
      return;
    }

    const text = data.getText();
    const entityId = text.replace('entity-', '');
    let entityCode: string;

    try {
      const results = await get(`entities/${projectCode}/${projectCode}`, {
        params: {
          filter: { id: entityId },
          fields: ['code'],
        },
      });
      const entity = results[0] ?? null;

      if (!entity) {
        setErrorMessage(
          'No matching entity found in selected project. Please try another QR code, or check your project selection.',
        );
        return;
      }
      entityCode = entity.code;
      // reset error message
      setErrorMessage(null);
    } catch (e) {
      setErrorMessage('Error fetching entity details. Please refresh the page and try again.');
      return;
    }

    const path = generatePath(ROUTE_STRUCTURE, {
      projectCode,
      dashboardName,
      entityCode,
    });

    // navigate to the entity page and close the scanner and entity search
    navigate({
      ...location,
      pathname: path,
    });

    setIsQRScannerOpen(false);
    onCloseEntitySearch();
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
            {errorMessage && <SmallAlert severity="error">{errorMessage}</SmallAlert>}
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
