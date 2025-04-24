import { Paper, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';
import styled from 'styled-components';

import { DatatrakWebEntityDescendantsRequest } from '@tupaia/types';
import { QrCodeScannerIcon } from '@tupaia/ui-components';

import { Button } from '../../components';
import { CloseButton, Modal, ModalContent } from '../../components/Modal';
import { isNullish, useIsMobile } from '../../utils';

const StyledButton = styled(Button).attrs({
  fullWidth: true,
  startIcon: <QrCodeScannerIcon style={{ fontSize: '1.5rem' }} />,
})``;

const ModalRoot = styled(Paper)`
  --scanner-size: min(85cqw, 70cqh);
  container: --qr-code-scanner-modal / size;
  background-color: black; // Visible when video stream is loading
  block-size: 100lvb;
  inline-size: 100lvi;

  ${CloseButton} {
    &.MuiIconButton-root:hover {
      background-color: oklch(100% 0 0 / 15%);
    }
    .MuiSvgIcon-root {
      color: white;
    }
  }

  ${ModalContent} {
    block-size: 100%;
    color: white;
    display: grid;
    grid-template-areas: '--instruction' '--scanner' '--feedback';
    grid-template-columns: 1fr;
    grid-template-rows: minmax(min-content, 1fr) var(--scanner-size) minmax(min-content, 1fr);
    inline-size: 100%;
    padding-block-start: unset;
    row-gap: 1.5rem;
    text-align: center;
    text-wrap: balance;
  }

  ${props => props.theme.breakpoints.down('sm')} {
    ${CloseButton} {
      top: max(env(safe-area-inset-top, 0), 1rem);
      right: max(env(safe-area-inset-right, 0), 1.25rem);
      .MuiSvgIcon-root {
        color: white;
      }
    }
  }

  ${props => props.theme.breakpoints.up('md')} {
    max-block-size: 32rem;
    max-inline-size: 48rem;
  }
`;

const Paragraph = styled(Typography).attrs({ variant: 'h1' })`
  align-self: end;
  font-weight: 500;
  grid-area: --instruction;
  letter-spacing: unset;
  margin-block: 0;
  z-index: 1;
`;

const Feedback = styled(Typography)`
  align-self: start;
  grid-area: --feedback;
  margin-block: 0;
  text-shadow: 0 0 1em black;
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
    gridColumn: '1 / -1',
    gridRow: '1 / -1',
    height: '100%',
    padding: 0,
    width: '100%',
  },
  videoStyle: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
  },
})`
	display: contents;
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

export interface QrCodeScannerProps {
  onSuccess?: (entity: DatatrakWebEntityDescendantsRequest.EntityResponse) => void;
  validEntities?: DatatrakWebEntityDescendantsRequest.ResBody;
}

export const QrCodeScanner = ({ onSuccess, validEntities }: QrCodeScannerProps) => {
  const isMobile = useIsMobile();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const openScanner = () => setIsScannerOpen(true);
  const closeScanner = () => setIsScannerOpen(false);

  const [feedback, setFeedback] = useState<React.ReactNode>(null);

  const onModalClose = () => {
    setFeedback(null);
    closeScanner();
  };

  const onResult: OnResultFunction = async (result, error) => {
    if (error?.message) {
      setFeedback(error.message);
      return;
    }

    if (isNullish(result)) return;

    const entityId = result.getText().replace(/^entity-/, '');
    if (!entityId.match(/^[a-f\d]{24}$/i)) {
      setFeedback(
        <>That doesn&rsquo;t look like a QR&nbsp;code for an entity. Please try again.</>,
      );
      return;
    }

    const entity = validEntities?.find(entity => entity.id === entityId);
    if (entity === undefined) {
      setFeedback('No matching entity found. Is this entity a valid answer to this question?');
      return;
    }

    onSuccess?.(entity);
    closeScanner();
    setFeedback(null);
  };

  return (
    <>
      <StyledButton onClick={openScanner}>Scan QR&nbsp;code</StyledButton>
      <Modal
        fullScreen={isMobile}
        open={isScannerOpen}
        onClose={onModalClose}
        PaperComponent={ModalRoot}
      >
        <Paragraph>Scan entity QR&nbsp;code</Paragraph>
        <StyledQrReader onResult={onResult} />
        <Feedback>{feedback}</Feedback>
        <Overlay />
      </Modal>
    </>
  );
};
