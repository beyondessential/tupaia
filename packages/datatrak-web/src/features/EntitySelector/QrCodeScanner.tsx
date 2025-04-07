import React, { useState } from 'react';
import { OnResultFunction, QrReader } from 'react-qr-reader';
import styled from 'styled-components';

import { QrCodeScannerIcon } from '@tupaia/ui-components';

import { Button } from '../../components';
import { CloseButton, Modal } from '../../components/Modal';
import { isNullish } from '../../utils';

const Wrapper = 'div';

const StyledButton = styled(Button).attrs({
  fullWidth: true,
  startIcon: <QrCodeScannerIcon style={{ fontSize: '1.5rem' }} />,
})``;

const OrDivider = styled.p`
  align-items: center;
  column-gap: 1em;
  display: grid;
  font-size: inherit;
  font-weight: 500;
  grid-template-columns: minmax(0, 1fr) min-content minmax(0, 1fr);
  inline-size: 100%;
  margin-block-start: 1em;
  text-box-edge: ex alphabetic; // Specific to the word “or”, which has no ascenders

  &::before,
  &::after {
    block-size: 0;
    border-block-end: max(0.0625rem, 1px) solid currentcolor;
    content: '';
  }
`;

const ModalRoot = styled.div`
  block-size: 100dvb;
  inline-size: 100dvi;
  ${CloseButton} {
    top: max(env(safe-area-inset-top, 0), 1rem);
    right: max(env(safe-area-inset-right, 0), 1.25rem);
    .MuiSvgIcon-root {
      color: white;
    }
  }
`;

const Instruction = styled.p`
  color: white;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-align: center;
  text-wrap: balance;
  z-index: 1;

  // @supports not (anchor-name: none) {
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% calc(-100% - 85dvmin / 2 - 2lh);
  // }
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
})``;

const Overlay = styled.div.attrs({ 'aria-hidden': true })`
  // Rounded square that fits
  aspect-ratio: 1;
  border-radius: 1.25rem;
  box-sizing: content-box;
  width: 85dvmin;

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

export const QrCodeScanner = (props: React.ComponentPropsWithoutRef<typeof Wrapper>) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const openScanner = () => setIsScannerOpen(true);
  const closeScanner = () => setIsScannerOpen(false);

  const onResult: OnResultFunction = (result, error) => {
    // console.log('onResult');
    // console.log('  result', result);
    // console.log('  error', error);

    if (error?.message) {
    }

    if (isNullish(result)) return;

    const text = result.getText();
    console.log(' text', text);
  };

  return (
    <div {...props}>
      <StyledButton onClick={openScanner}>Scan QR&nbsp;code</StyledButton>
      <Modal fullScreen open={isScannerOpen} onClose={closeScanner} PaperComponent={ModalRoot}>
        <Instruction>Scan entity QR&nbsp;code</Instruction>
        <StyledQrReader onResult={onResult} />
        <Overlay />
      </Modal>
      <OrDivider>or</OrDivider>
    </div>
  );
};
