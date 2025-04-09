import { Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';
import styled from 'styled-components';

import { Entity } from '@tupaia/types';
import { QrCodeScannerIcon } from '@tupaia/ui-components';

import { Button } from '../../components';
import { CloseButton, Modal, ModalContent } from '../../components/Modal';
import { isNullish } from '../../utils';

const StyledButton = styled(Button).attrs({
  fullWidth: true,
  startIcon: <QrCodeScannerIcon style={{ fontSize: '1.5rem' }} />,
})``;

const ModalRoot = styled.div`
  --scanner-size: 85dvmin;
  background-color: black; // Visible when video stream is loading

  ${CloseButton} {
    top: max(env(safe-area-inset-top, 0), 1rem);
    right: max(env(safe-area-inset-right, 0), 1.25rem);
    .MuiSvgIcon-root {
      color: white;
    }
  }

  ${ModalContent} {
    color: white;
    display: grid;
    grid-template-areas: '--instruction' '--scanner' '--feedback';
    grid-template-columns: 1fr;
    grid-template-rows: minmax(min-content, 1fr) var(--scanner-size) minmax(min-content, 1fr);
    padding-block-start: unset;
    row-gap: 1.5rem;
    text-align: center;
    text-wrap: balance;
  }
`;

const Paragraph = styled(Typography).attrs({ variant: 'h1' })`
  align-self: end;
  font-weight: 500;
  grid-area: --instruction;
  margin-block: 0;
  z-index: 1;
`;

const Feedback = styled(Typography)`
  align-self: start;
  grid-area: --feedback;
  margin-block: 0;
  z-index: 1;
`;

const StyledQrReader = (styled(QrReader)<{
  /* qr-code-reader declares these as `any`s */
  containerStyle?: React.CSSProperties;
  videoContainerStyle?: React.CSSProperties;
  videoStyle?: React.CSSProperties;
}>).attrs({
  constraints: {
    facingMode: 'environment',
  },
  videoContainerStyle: {
    height: '100lvh',
    width: '100lvw',
    padding: 0,
  },
  videoStyle: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
})`
	grid-column: 1 / -1;
	grid-row: 1 / -1;
`;

const Overlay = styled.div.attrs({ 'aria-hidden': true })`
  // Rounded square that fits
  aspect-ratio: 1;
  border-radius: 1.25rem;
  box-sizing: content-box;
  width: var(--scanner-size);

  // Centred on screen
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;

  // The mask
  box-shadow: 0 0 0 50dvmax oklch(0 0 0 / 50%);

  // Decorative border
  outline: calc(max(0.0625rem, 1px) * 3) solid white;
  outline-offset: calc(max(0.0625rem, 1px) * 3);

  pointer-events: none;
`;

interface QrCodeScannerProps {
  onSuccess?: (entityId: Entity['id']) => void;
}

export const QrCodeScanner = ({ onSuccess }: QrCodeScannerProps) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const openScanner = () => setIsScannerOpen(true);
  const closeScanner = () => setIsScannerOpen(false);

  const [message, setMessage] = useState<string | null>();

  const onResult: OnResultFunction = (result, error) => {
    if (error?.message) {
      setMessage(error.message);
      return;
    }

    if (isNullish(result)) return;

    const text = result.getText();
    const entityId = text.replace('entity-', '');
    // TODO: Validate entity ID format
    onSuccess?.(entityId);
    closeScanner();
  };

  return (
    <>
      <StyledButton onClick={openScanner}>Scan QR&nbsp;code</StyledButton>
      <Modal fullScreen open={isScannerOpen} onClose={closeScanner} PaperComponent={ModalRoot}>
        <Paragraph>Scan entity QR&nbsp;code</Paragraph>
        <StyledQrReader onResult={onResult} />
        <Feedback>{message}</Feedback>
        <Overlay />
      </Modal>
    </>
  );
};
