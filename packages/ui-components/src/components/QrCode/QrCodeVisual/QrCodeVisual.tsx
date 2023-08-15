/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Container } from '@material-ui/core';
import { Data } from '../../../types';
import { SingleQrCode } from './SingleQrCode';
import { MultiQrCodes } from './MultiQrCode';
import { DownloadMultiQrCodes } from './DownloadMultiQrCodes';

const Wrapper = styled(Container).attrs({
  maxWidth: 'sm',
})`
  padding-bottom: 1rem;
`;

interface QrCodeVisualProps {
  data?: Data[];
  onCloseModal: () => void;
  isEnlarged?: boolean;
}

export const QrCodeVisual = ({
  data: options = [],
  onCloseModal,
  isEnlarged,
}: QrCodeVisualProps) => {
  if (isEnlarged) return <DownloadMultiQrCodes data={options} onCancelDownload={onCloseModal} />;

  return (
    <Wrapper>
      {options.length > 1 ? <MultiQrCodes data={options} /> : <SingleQrCode data={options} />}
    </Wrapper>
  );
};
