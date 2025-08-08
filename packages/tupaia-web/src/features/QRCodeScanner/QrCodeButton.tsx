import React from 'react';
import styled from 'styled-components';
import { Button, QrCodeScannerIcon } from '@tupaia/ui-components';

export const QrScanButton = styled(Button).attrs({
  startIcon: <QrCodeScannerIcon />,
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
