import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { generateQrCodeCanvas } from './utils';

const StyledCanvas = styled.canvas`
  //  Display Flex doesn't work well with exports on canvas so use display block to center the canvas
  display: block;
  outline: 1px solid #dedede;
  width: 80%;
  margin: 0 auto;
`;

interface QrCodeImageProps {
  qrCodeContents?: string;
  humanReadableId?: string;
  className?: string;
}

export const QrCodeImage = ({ className, qrCodeContents, humanReadableId }: QrCodeImageProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (ref.current) generateQrCodeCanvas(humanReadableId, qrCodeContents, ref.current);
  }, [ref.current]);

  return (
    <div className={className}>
      <StyledCanvas ref={ref} aria-label={`QRCode for ${humanReadableId || qrCodeContents}`} />
    </div>
  );
};
