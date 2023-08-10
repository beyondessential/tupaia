/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { drawQrCodeCanvas } from './useQrCodeCanvas';

const StyledCanvas = styled.canvas`
  outline: 1px solid #dedede;
`;

interface QrCodeImageProps {
  qrCodeContents: string;
  humanReadableId: string;
  width?: number | undefined;
  margin?: number | string | undefined;
}

export const QrCodeImage = ({ qrCodeContents, humanReadableId, width = undefined, margin = 'auto' }: QrCodeImageProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    drawQrCodeCanvas(ref, humanReadableId, qrCodeContents);
  }, [ref]);


  return (
    <Box style={{
      display: 'flex',
      justifyContent: 'center',
      width,
      margin
    }}>
      <StyledCanvas style={{width: '80%'}} ref={ref} />
    </Box>
  );
};