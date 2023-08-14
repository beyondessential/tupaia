/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { drawQrCode } from './useQrCode';

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
    drawQrCode(ref, humanReadableId, qrCodeContents);
  }, [ref]);

  return (
    <StyledBox className={className}>
      <StyledCanvas ref={ref} />
    </StyledBox>
  );
};
