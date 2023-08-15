/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { generateQrCodeDataUrl } from './utils';

const StyledCanvas = styled.canvas`
  outline: 1px solid #dedede;
  width: 80%;
`;

const StyledBox = styled(Box)`
  display: flex;
  justify-content: center;
  margin: auto;
`;

interface QrCodeImageProps {
  qrCodeContents: string;
  humanReadableId: string;
  className?: string;
}

export const QrCodeImage = ({ className, qrCodeContents, humanReadableId }: QrCodeImageProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    generateQrCodeDataUrl(humanReadableId, qrCodeContents, ref?.current as HTMLCanvasElement);
  }, [ref]);

  return (
    <StyledBox className={className}>
      <StyledCanvas ref={ref} aria-label={`QRCode for ${humanReadableId}`} />
    </StyledBox>
  );
};
