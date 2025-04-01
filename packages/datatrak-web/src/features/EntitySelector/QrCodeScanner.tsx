import React from 'react';
import styled from 'styled-components';
import { QrCodeScannerIcon } from '@tupaia/ui-components';
import { Button } from '../../components';

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

export const QrCodeScanner = (props: React.ComponentPropsWithoutRef<typeof Wrapper>) => {
  return (
    <div {...props}>
      <StyledButton>Scan QR&nbsp;code</StyledButton>
      <OrDivider>or</OrDivider>
    </div>
  );
};
