/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { QRScanIcon } from './QRScanIcon';

export const QrScanButton = styled(Button).attrs({
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
